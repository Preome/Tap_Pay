import io
import qrcode
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Sum, Count
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from merchants.models import Merchant
from merchants.serializers import MerchantSerializer, MerchantPublicSerializer
from transactions.models import Transaction

class MerchantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Merchant.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'lookup':
            return MerchantPublicSerializer
        return MerchantSerializer

    def retrieve(self, request, pk=None):
        merchant = get_object_or_404(Merchant, registration_number=pk, is_verified=True)
        return Response(MerchantPublicSerializer(merchant).data)

    @action(detail=False, methods=['get'], url_path='lookup/(?P<code>[^/.]+)')
    def lookup(self, request, code=None):
        merchant = get_object_or_404(Merchant, registration_number=code, is_verified=True)
        return Response(MerchantPublicSerializer(merchant).data)

    @action(detail=False, methods=['get'], url_path='qr/(?P<code>[^/.]+)')
    def qr_code(self, request, code=None):
        merchant = get_object_or_404(Merchant, registration_number=code, is_verified=True)

        qr_data = f"TAPPAY:MERCHANT:{merchant.registration_number}:{merchant.business_name}"

        qr = qrcode.QRCode(version=2, box_size=12, border=2)
        qr.add_data(qr_data)
        qr.make(fit=True)

        matrix = qr.modules
        n = len(matrix)
        box = 12
        border_boxes = 2
        size = (n + 2 * border_boxes) * box

        rects = [f'<rect width="{size}" height="{size}" fill="white"/>']
        for r in range(n):
            for c in range(n):
                if matrix[r][c]:
                    x = (c + border_boxes) * box
                    y = (r + border_boxes) * box
                    rects.append(f'<rect x="{x}" y="{y}" width="{box}" height="{box}" fill="black"/>')

        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" '
            f'width="{size}" height="{size}">'
            f'{"".join(rects)}'
            f'</svg>'
        )

        return HttpResponse(svg, content_type='image/svg+xml')

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_merchant(self, request):
        merchant = Merchant.objects.filter(user=request.user).first()
        if merchant:
            return Response(MerchantSerializer(merchant).data)
        if request.user.user_type == 'MERCHANT':
            merchant = Merchant.objects.create(
                user=request.user,
                business_name=request.user.username,
                registration_number=f"REG-{request.user.id:06d}",
                is_verified=True
            )
            return Response(MerchantSerializer(merchant).data, status=status.HTTP_201_CREATED)
        return Response({'error': 'Merchant profile not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def stats(self, request):
        merchant = Merchant.objects.filter(user=request.user).first()
        if not merchant:
            if request.user.user_type == 'MERCHANT':
                merchant = Merchant.objects.create(
                    user=request.user,
                    business_name=request.user.username,
                    registration_number=f"REG-{request.user.id:06d}",
                    is_verified=True
                )
            else:
                return Response({
                    'today_sales': 0,
                    'total_customers': 0,
                    'total_revenue': 0,
                    'total_transactions': 0,
                })

        today = timezone.now().date()

        all_txns = Transaction.objects.filter(
            merchant=merchant,
            status='COMPLETED'
        )

        today_txns = all_txns.filter(created_at__date=today)

        data = {
            'today_sales': today_txns.aggregate(total=Sum('amount'))['total'] or 0,
            'total_customers': all_txns.values('sender').distinct().count(),
            'total_revenue': all_txns.aggregate(total=Sum('amount'))['total'] or 0,
            'total_transactions': all_txns.count(),
        }

        return Response(data)
