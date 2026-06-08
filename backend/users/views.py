from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.db.models import Q, F, Sum, Count
from django.utils import timezone
from transactions.models import Transaction
from .serializers import UserSerializer, UserRegistrationSerializer
from transactions.serializers import TransactionSerializer, TransactionListSerializer
from wallets.models import Wallet
from django.db import transaction as db_transaction
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ('create', 'register'):
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], authentication_classes=[])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class TransactionViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        queryset = Transaction.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user) | Q(agent=self.request.user)
        ).select_related(
            'sender',
            'receiver',
            'agent',
            'merchant'
        ).prefetch_related(
            'merchant__user'
        )

        transaction_type = self.request.query_params.get('type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)

        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        queryset = queryset.annotate(
            sender_phone=F('sender__phone_number'),
            receiver_phone=F('receiver__phone_number'),
            agent_phone=F('agent__phone_number')
        )

        return queryset

    def get_serializer_class(self):

        if self.action == 'list':
            return TransactionListSerializer
        return TransactionSerializer

    @action(detail=False, methods=['get'])
    def summary(self, request):

        user = request.user

        summary = Transaction.objects.filter(
            Q(sender=user) | Q(receiver=user),
            status='COMPLETED'
        ).aggregate(
            total_sent=Sum('amount', filter=Q(sender=user)),
            total_received=Sum('amount', filter=Q(receiver=user)),
            transaction_count=Count('id')
        )

        return Response(summary)

    @action(detail=False, methods=['post'])
    def cash_in(self, request):

        user = request.user
        if user.user_type != 'AGENT':
            return Response({'error': 'Only agents can perform cash in'}, status=status.HTTP_403_FORBIDDEN)

        receiver_phone = request.data.get('receiver_phone')
        amount = Decimal(request.data.get('amount', 0))

        try:
            from users.models import User
            receiver = User.objects.get(phone_number=receiver_phone)

            with db_transaction.atomic():
                agent_wallet = Wallet.objects.select_for_update().get(user=user)
                if agent_wallet.balance < amount:
                    return Response({'error': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)

                transaction = Transaction.objects.create(
                    transaction_id=f"CI{timezone.now().strftime('%Y%m%d%H%M%S')}{user.id}",
                    transaction_type='CASH_IN',
                    amount=amount,
                    agent=user,
                    receiver=receiver,
                    status='COMPLETED'
                )

                agent_wallet.balance = F('balance') - amount
                agent_wallet.save(update_fields=['balance'])
                Wallet.objects.filter(user=receiver).update(balance=F('balance') + amount)

                return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def send_money(self, request):

        sender = request.user
        receiver_phone = request.data.get('receiver_phone')
        amount = Decimal(request.data.get('amount', 0))

        try:
            from users.models import User
            receiver = User.objects.select_related('wallet').get(phone_number=receiver_phone)

            with db_transaction.atomic():

                sender_wallet = Wallet.objects.select_for_update().get(user=sender)
                if sender_wallet.balance < amount:
                    return Response({'error': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)

                transaction = Transaction.objects.create(
                    transaction_id=f"SM{timezone.now().strftime('%Y%m%d%H%M%S')}{sender.id}",
                    transaction_type='SEND_MONEY',
                    amount=amount,
                    sender=sender,
                    receiver=receiver,
                    status='COMPLETED'
                )

                sender_wallet.balance = F('balance') - amount
                sender_wallet.save(update_fields=['balance'])
                Wallet.objects.filter(user=receiver).update(balance=F('balance') + amount)

                return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({'error': 'Receiver not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def merchant_payment(self, request):

        user = request.user
        merchant_code = request.data.get('merchant_code')
        amount = Decimal(request.data.get('amount', 0))

        try:
            from merchants.models import Merchant
            merchant = Merchant.objects.select_related('user__wallet').get(registration_number=merchant_code, is_verified=True)

            with db_transaction.atomic():
                user_wallet = Wallet.objects.select_for_update().get(user=user)
                if user_wallet.balance < amount:
                    return Response({'error': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)

                transaction = Transaction.objects.create(
                    transaction_id=f"MP{timezone.now().strftime('%Y%m%d%H%M%S')}{user.id}",
                    transaction_type='MERCHANT_PAYMENT',
                    amount=amount,
                    sender=user,
                    merchant=merchant,
                    status='COMPLETED'
                )

                user_wallet.balance = F('balance') - amount
                user_wallet.save(update_fields=['balance'])
                Wallet.objects.filter(user=merchant.user).update(balance=F('balance') + amount)

                return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
        except Merchant.DoesNotExist:
            return Response({'error': 'Merchant not found'}, status=status.HTTP_404_NOT_FOUND)
