from decimal import Decimal

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def migrate_purchase_costs_to_lines(apps, schema_editor):
    PurchaseCost = apps.get_model("inventory", "PurchaseCost")
    PurchaseCostLine = apps.get_model("inventory", "PurchaseCostLine")
    FinanceEntry = apps.get_model("finance", "FinanceEntry")
    AccountBalance = apps.get_model("finance", "AccountBalance")
    db_alias = schema_editor.connection.alias

    cost_fields = [
        ("watch_cost", "watch", "Costo del reloj"),
        ("shipping_cost", "shipping", "Costo de envio"),
        ("maintenance_cost", "maintenance", "Mantenimiento"),
        ("other_costs", "other", "Otros costos"),
    ]

    for purchase_cost in PurchaseCost.objects.using(db_alias).select_related("product"):
        product = purchase_cost.product
        old_entries = FinanceEntry.objects.using(db_alias).filter(
            product_id=product.id,
            concept="purchase",
            is_deleted=False,
        )
        old_entries.update(is_deleted=True)

        for field_name, cost_type, label in cost_fields:
            amount = Decimal(str(getattr(purchase_cost, field_name) or "0.00"))
            if amount <= 0:
                continue

            finance_entry = FinanceEntry.objects.using(db_alias).create(
                entry_type="expense",
                concept="purchase",
                amount=amount,
                account=purchase_cost.source_account or "cash",
                entry_date=purchase_cost.purchase_date,
                is_automatic=True,
                notes=purchase_cost.notes or label,
                product_id=product.id,
                created_by_id=product.created_by_id,
                updated_by_id=product.updated_by_id,
                is_deleted=False,
            )
            PurchaseCostLine.objects.using(db_alias).create(
                product_id=product.id,
                cost_type=cost_type,
                amount=amount,
                account=purchase_cost.source_account or "cash",
                payment_method=purchase_cost.payment_method or "cash",
                cost_date=purchase_cost.purchase_date,
                notes=purchase_cost.notes or "",
                finance_entry_id=finance_entry.id,
                created_by_id=product.created_by_id,
                updated_by_id=product.updated_by_id,
                is_deleted=False,
            )

    for account in ["cash", "bbva", "credit", "amex"]:
        income_total = sum(
            entry.amount
            for entry in FinanceEntry.objects.using(db_alias).filter(
                account=account,
                entry_type="income",
                is_deleted=False,
            )
        )
        expense_total = sum(
            entry.amount
            for entry in FinanceEntry.objects.using(db_alias).filter(
                account=account,
                entry_type="expense",
                is_deleted=False,
            )
        )
        balance, _ = AccountBalance.objects.using(db_alias).get_or_create(account=account)
        balance.balance = income_total - expense_total
        balance.save(update_fields=["balance", "updated_at"])


class Migration(migrations.Migration):

    dependencies = [
        ("finance", "0004_alter_financeentry_concept"),
        ("inventory", "0006_alter_inventoryitem_options_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="PurchaseCostLine",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("is_deleted", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "cost_type",
                    models.CharField(
                        choices=[
                            ("watch", "Reloj"),
                            ("shipping", "Envio"),
                            ("maintenance", "Mantenimiento"),
                            ("other", "Otro"),
                        ],
                        default="other",
                        max_length=20,
                    ),
                ),
                (
                    "amount",
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        max_digits=10,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "account",
                    models.CharField(
                        choices=[
                            ("cash", "Efectivo"),
                            ("bbva", "BBVA"),
                            ("credit", "Credito"),
                            ("amex", "Amex"),
                        ],
                        default="cash",
                        max_length=20,
                    ),
                ),
                (
                    "payment_method",
                    models.CharField(
                        choices=[
                            ("cash", "Efectivo"),
                            ("transfer", "Transferencia"),
                            ("card", "Tarjeta"),
                            ("msi", "MSI"),
                            ("consignment", "Consigna"),
                        ],
                        default="cash",
                        max_length=20,
                    ),
                ),
                ("cost_date", models.DateField()),
                ("notes", models.TextField(blank=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="%(app_label)s_%(class)s_created",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "finance_entry",
                    models.OneToOneField(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="purchase_cost_line",
                        to="finance.financeentry",
                    ),
                ),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="purchase_cost_lines",
                        to="inventory.inventoryitem",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="%(app_label)s_%(class)s_updated",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["cost_date", "created_at", "id"],
            },
        ),
        migrations.RunPython(migrate_purchase_costs_to_lines, migrations.RunPython.noop),
    ]
