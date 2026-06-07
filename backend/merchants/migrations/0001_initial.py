from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Merchant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('business_name', models.CharField(max_length=200)),
                ('business_type', models.CharField(max_length=100)),
                ('trade_license_number', models.CharField(max_length=50, unique=True)),
                ('qr_code', models.ImageField(blank=True, null=True, upload_to='merchant_qr/')),
                ('is_verified', models.BooleanField(default=False)),
                ('commission_rate', models.DecimalField(decimal_places=2, default=1.0, max_digits=5)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'merchants',
            },
        ),
    ]
