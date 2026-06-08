from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator, MinLengthValidator

class User(AbstractUser):
    USER_TYPES = (
        ('USER', 'User'),
        ('MERCHANT', 'Merchant'),
        ('AGENT', 'Agent'),
        ('ADMIN', 'Admin'),
    )
    
    # Common fields
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='USER')
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, unique=True)
    pin = models.CharField(max_length=4, validators=[MinLengthValidator(4)], blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    
    # Personal information
    full_name = models.CharField(max_length=150, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    
    # Agent specific fields
    agent_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    nid_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    
    # Merchant specific fields (for merchants who are also users)
    business_name = models.CharField(max_length=200, blank=True, null=True)
    registration_number = models.CharField(max_length=50, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['user_type', 'is_verified']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['agent_code']),
            models.Index(fields=['nid_number']),
        ]
    
    def __str__(self):
        return f"{self.username} - {self.get_user_type_display()} - {self.phone_number}"
    
    def save(self, *args, **kwargs):
        if not self.username and self.phone_number:
            self.username = self.phone_number
        super().save(*args, **kwargs)