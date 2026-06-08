from django.db import models
from django.core.validators import MinValueValidator
from django.db.models import Q, F
from decimal import Decimal

class TransactionManager(models.Manager):
    def get_user_transactions(self, user):
        return self.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related('sender', 'receiver', 'agent', 'merchant')
    
    def get_pending_transactions(self):
        return self.filter(status='PENDING')
    
    def get_daily_summary(self, user, date):
        return self.filter(
            Q(sender=user) | Q(receiver=user),
            created_at__date=date,
            status='COMPLETED'
        )

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('CASH_IN', 'Cash In'),
        ('CASH_OUT', 'Cash Out'),
        ('SEND_MONEY', 'Send Money'),
        ('MERCHANT_PAYMENT', 'Merchant Payment'),
    )
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    transaction_id = models.CharField(max_length=20, unique=True, db_index=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0.01)])
    sender = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='sent_transactions', null=True, blank=True)
    receiver = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='received_transactions', null=True, blank=True)
    agent = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='agent_transactions', null=True, blank=True)
    merchant = models.ForeignKey('merchants.Merchant', on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    reference = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TransactionManager()
    
    class Meta:
        db_table = 'transactions'
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['sender', 'status']),
            models.Index(fields=['receiver', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['transaction_type', 'status']),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(amount__gt=0), name='amount_positive'),
        ]
    
    def __str__(self):
        return f"{self.transaction_id} - {self.transaction_type} - {self.amount}"