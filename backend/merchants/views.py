import io
import qrcode
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from merchants.models import Merchant
from merchants.serializers import MerchantSerializer, MerchantPublicSerializer

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

        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(qr_data)
        qr.make(fit=True)

        from qrcode.image.svg import SvgPathImage
        img = qr.make_image(image_factory=SvgPathImage)

        buffer = io.BytesIO()
        img.save(buffer)
        buffer.seek(0)

        return HttpResponse(buffer.getvalue(), content_type='image/svg+xml')

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
