from rest_framework import serializers
from transactions.models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class TransactionListSerializer(serializers.ModelSerializer):
    sender_phone = serializers.CharField(read_only=True)
    receiver_phone = serializers.CharField(read_only=True)
    agent_phone = serializers.CharField(read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'id', 'transaction_id', 'transaction_type', 'amount',
            'sender', 'receiver', 'agent', 'status', 'created_at',
            'sender_phone', 'receiver_phone', 'agent_phone'
        )
