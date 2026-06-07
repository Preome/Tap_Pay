from django.db import models
from django.core.validators import RegexValidator

class MerchantManager(models.Manager):
    def get_verified_merchants(self):
        return self.filter(is_verified=True)

    def get_merchant_with_qr(self):
        return self.filter(qr_code__isnull=False)

class Merchant(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='merchant_profile')
    business_name = models.CharField(max_length=200)
    business_type = models.CharField(max_length=100)
    trade_license_number = models.CharField(max_length=50, unique=True)
    qr_code = models.ImageField(upload_to='merchant_qr/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = MerchantManager()

    class Meta:
        db_table = 'merchants'
        indexes = [
            models.Index(fields=['business_name']),
            models.Index(fields=['trade_license_number']),
            models.Index(fields=['is_verified']),
        ]

    def __str__(self):
        return self.business_name
