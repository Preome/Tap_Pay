import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('merchants', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='merchant',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='merchant_profile', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddIndex(
            model_name='merchant',
            index=models.Index(fields=['business_name'], name='merchants_busines_c6cdd8_idx'),
        ),
        migrations.AddIndex(
            model_name='merchant',
            index=models.Index(fields=['trade_license_number'], name='merchants_trade_l_a6000f_idx'),
        ),
        migrations.AddIndex(
            model_name='merchant',
            index=models.Index(fields=['is_verified'], name='merchants_is_veri_5ffd82_idx'),
        ),
    ]
