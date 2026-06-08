from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from merchants.models import Merchant

User = get_user_model()

class Command(BaseCommand):
    help = 'Create Merchant profiles for existing users with user_type=MERCHANT'

    def handle(self, *args, **options):
        merchants = User.objects.filter(user_type='MERCHANT')
        created = 0
        for user in merchants:
            if not hasattr(user, 'merchant_profile') or user.merchant_profile is None:
                Merchant.objects.create(
                    user=user,
                    business_name=user.business_name or user.username,
                    registration_number=f"REG-{user.id:06d}",
                    is_verified=True
                )
                created += 1
                self.stdout.write(f"Created merchant profile for {user.username}")

        self.stdout.write(self.style.SUCCESS(f"Created {created} merchant profile(s)"))
