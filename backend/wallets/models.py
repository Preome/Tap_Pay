from django.db import models
from django.core.validators import MinValueValidator
from django.db.models import Q, F
from decimal import Decimal

class WalletManager(models.Manager):
    def get_active_wallets(self):
        return self.filter(is_active=True)

    def get_user_wallet(self, user):
        return self.get(user=user, is_active=True)

    def get_balance_above(self, amount):
        return self.filter(balance__gte=amount)

class Wallet(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    pin = models.CharField(max_length=4, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = WalletManager()

    class Meta:
        db_table = 'wallets'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['balance']),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(balance__gte=0), name='balance_non_negative'),
        ]

    def __str__(self):
        return f"{self.user.username}'s Wallet - Balance: {self.balance}"

    def deposit(self, amount):

        if amount > 0:
            self.balance = F('balance') + amount
            self.save(update_fields=['balance'])
            self.refresh_from_db()
            return True
        return False

    def withdraw(self, amount):

        if amount > 0 and self.balance >= amount:
            self.balance = F('balance') - amount
            self.save(update_fields=['balance'])
            self.refresh_from_db()
            return True
