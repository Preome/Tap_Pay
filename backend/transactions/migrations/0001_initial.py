from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_id', models.CharField(max_length=20, unique=True)),
                ('transaction_type', models.CharField(choices=[('CASH_IN', 'Cash In'), ('CASH_OUT', 'Cash Out'), ('SEND_MONEY', 'Send Money'), ('MERCHANT_PAYMENT', 'Merchant Payment')], max_length=20)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('COMPLETED', 'Completed'), ('FAILED', 'Failed')], default='PENDING', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'transactions',
            },
        ),
    ]
