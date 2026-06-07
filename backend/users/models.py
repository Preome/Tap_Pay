from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from phonenumber_field.modelfields import PhoneNumberField

class User(AbstractUser):
    USER_TYPES = (
        ('USER', 'User'),
        ('MERCHANT', 'Merchant'),
        ('AGENT', 'Agent'),
        ('ADMIN', 'Admin'),
    )

    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='USER')
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, unique=True)
    nid_number = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['user_type', 'is_verified']),
            models.Index(fields=['phone_number']),
        ]

    def __str__(self):
        return self.username
