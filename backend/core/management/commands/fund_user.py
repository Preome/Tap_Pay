from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from wallets.models import Wallet
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Add balance to a user wallet by phone number'

    def add_arguments(self, parser):
        parser.add_argument('phone', type=str, help='User phone number')
        parser.add_argument('amount', type=Decimal, help='Amount to add to wallet')

    def handle(self, *args, **options):
        phone = options['phone']
        amount = options['amount']

        try:
            user = User.objects.get(phone_number=phone)
        except User.DoesNotExist:
            self.stderr.write(self.style.ERROR(f'User with phone {phone} not found'))
            return

        wallet, created = Wallet.objects.get_or_create(user=user, defaults={'balance': 0})

        wallet.balance += amount
        wallet.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'Added {amount} to {user.username} (phone: {phone}). New balance: {wallet.balance}'
            )
        )
