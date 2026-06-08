from rest_framework import serializers
from merchants.models import Merchant

class MerchantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = '__all__'

class MerchantPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ('id', 'registration_number', 'business_name', 'business_type', 'is_verified')
