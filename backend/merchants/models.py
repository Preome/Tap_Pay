from django.db import models
from django.conf import settings
from django.core.validators import MinLengthValidator

class MerchantManager(models.Manager):
    def get_verified_merchants(self):
        return self.filter(is_verified=True, is_active=True)
    
    def get_by_registration_number(self, reg_number):
        return self.filter(registration_number=reg_number).first()

class Merchant(models.Model):
    BUSINESS_TYPES = (
        ('RETAIL', 'Retail Store'),
        ('RESTAURANT', 'Restaurant'),
        ('SERVICE', 'Service Provider'),
        ('E_COMMERCE', 'E-commerce'),
        ('WHOLESALE', 'Wholesale'),
        ('OTHER', 'Other'),
    )
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='merchant_profile'
    )
    
    # Business Information
    business_name = models.CharField(max_length=200, db_index=True)
    registration_number = models.CharField(
        max_length=50, 
        unique=True, 
        db_index=True,
        validators=[MinLengthValidator(6)],
        help_text="Organization registration number (Trade License, RJSC, etc.)"
    )
    business_type = models.CharField(max_length=20, choices=BUSINESS_TYPES, default='RETAIL')
    business_address = models.TextField(blank=True)
    business_phone = models.CharField(max_length=17, blank=True)
    business_email = models.EmailField(blank=True)
    
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Additional Info
    website = models.URLField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    objects = MerchantManager()
    
    class Meta:
        db_table = 'merchants'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['business_name']),
            models.Index(fields=['registration_number']),
            models.Index(fields=['is_verified', 'is_active']),
            models.Index(fields=['business_type']),
        ]
        verbose_name = 'Merchant'
        verbose_name_plural = 'Merchants'
    
    def __str__(self):
        return f"{self.business_name} ({self.registration_number})"
    
    def get_merchant_code(self):
        """Generate merchant code from registration number"""
        return f"MER-{self.id:06d}"
    
    @property
    def is_verified_merchant(self):
        return self.is_verified and self.is_active