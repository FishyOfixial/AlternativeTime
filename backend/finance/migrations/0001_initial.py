# Generated manually for finance core alignment.
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("inventory", "0005_inventoryitem_core_alignment"),
        ("sales", "0002_sale_core_alignment"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AccountBalance",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "account",
                    models.CharField(
                        choices=[
                            ("cash", "Efectivo"),
                            ("bbva", "BBVA"),
                            ("credit", "Credito"),
                            ("amex", "Amex"),
                        ],
                        max_length=20,
                        unique=True,
                    ),
                ),
                ("balance", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["account"]},
        ),
        migrations.CreateModel(
            name="FinanceEntry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("is_deleted", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "entry_type",
                    models.CharField(
                        choices=[("income", "Ingreso"), ("expense", "Egreso")],
                        max_length=20,
                    ),
                ),
                (
                    "concept",
                    models.CharField(
                        choices=[("sale", "Venta"), ("purchase", "Compra")],
                        max_length=20,
                    ),
                ),
                ("amount", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "account",
                    models.CharField(
                        choices=[
                            ("cash", "Efectivo"),
                            ("bbva", "BBVA"),
                            ("credit", "Credito"),
                            ("amex", "Amex"),
                        ],
                        max_length=20,
                    ),
                ),
                ("entry_date", models.DateField()),
                ("is_automatic", models.BooleanField(default=True)),
                ("notes", models.TextField(blank=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="finance_financeentry_created",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="finance_financeentry_updated",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "product",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="finance_entries",
                        to="inventory.inventoryitem",
                    ),
                ),
                (
                    "sale",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="finance_entries",
                        to="sales.sale",
                    ),
                ),
            ],
            options={"ordering": ["-entry_date", "-created_at"]},
        ),
    ]
