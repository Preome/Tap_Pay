from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from wallets.models import Wallet
from merchants.models import Merchant

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    business_name = serializers.CharField(required=False, allow_blank=True)
    registration_number = serializers.CharField(required=False, allow_blank=True)
    business_type = serializers.CharField(required=False, allow_blank=True)
    business_address = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'phone_number', 'user_type', 'nid_number', 'date_of_birth', 'address', 'business_name', 'registration_number', 'business_type', 'business_address')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        business_name = validated_data.pop('business_name', '')
        registration_number = validated_data.pop('registration_number', '')
        business_type = validated_data.pop('business_type', '')
        business_address = validated_data.pop('business_address', '')
        user = User.objects.create_user(**validated_data)

        # Initialize wallet PIN.
        # This project uses the User model's `pin` field as the transaction PIN.
        Wallet.objects.create(user=user, balance=0, pin=user.pin)



        if validated_data.get('user_type') == 'MERCHANT' and registration_number:
            Merchant.objects.create(
                user=user,
                business_name=business_name or user.username,
                registration_number=registration_number,
                business_type=business_type or 'RETAIL',
                business_address=business_address,
                is_verified=True
            )

        return user

class UserSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = '__all__'

    def get_balance(self, obj):
        try:
            return float(obj.wallet.balance)
        except:
            return 0.0
