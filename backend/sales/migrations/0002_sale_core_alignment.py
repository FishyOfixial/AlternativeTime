from decimal import Decimal

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone


def migrate_sales_data(apps, schema_editor):
    Sale = apps.get_model("sales", "Sale")
    SaleItem = apps.get_model("sales", "SaleItem")
    PurchaseCost = apps.get_model("inventory", "PurchaseCost")
    db_alias = schema_editor.connection.alias

    for sale in Sale.objects.using(db_alias).all():
        sale_item = (
            SaleItem.objects.using(db_alias)
            .filter(sale_id=sale.id)
            .select_related("inventory_item")
            .order_by("id")
            .first()
        )
        if sale_item is None:
            continue

        product = sale_item.inventory_item
        purchase_cost = PurchaseCost.objects.using(db_alias).filter(product_id=product.id).first()
        cost_snapshot = purchase_cost.total_pagado if purchase_cost else Decimal("0.00")
        sale_date = timezone.localdate(sale.created_at)
        gross_profit = (sale.total or sale_item.subtotal or Decimal("0.00")) - cost_snapshot
        profit_percentage = (
            gross_profit / cost_snapshot if cost_snapshot and cost_snapshot > 0 else Decimal("0.0000")
        )

        sale.product_id = product.id
        sale.sale_date = sale_date
        sale.payment_method = getattr(product, "payment_method", "cash") or "cash"
        sale.sales_channel = getattr(product, "sales_channel", "marketplace") or "marketplace"
        sale.amount_paid = sale.total or sale_item.subtotal or Decimal("0.00")
        sale.extras = Decimal("0.00")
        sale.sale_shipping_cost = Decimal("0.00")
        sale.cost_snapshot = cost_snapshot
        sale.gross_profit = gross_profit
        sale.profit_percentage = profit_percentage
        sale.customer_name = sale.client.name if sale.client_id else ""
        sale.customer_contact = sale.client.phone if sale.client_id else ""
        sale.is_deleted = False
        sale.save()


class Migration(migrations.Migration):
    dependencies = [
        ("inventory", "0005_inventoryitem_core_alignment"),
        ("sales", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="sale",
            name="amount_paid",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name="sale",
            name="cost_snapshot",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name="sale",
            name="customer_contact",
            field=models.CharField(blank=True, max_length=80),
        ),
        migrations.AddField(
            model_name="sale",
            name="customer_name",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="sale",
            name="extras",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name="sale",
            name="gross_profit",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name="sale",
            name="is_deleted",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="sale",
            name="notes",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="sale",
            name="payment_method",
            field=models.CharField(
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
        migrations.AddField(
            model_name="sale",
            name="product",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="sales_records",
                to="inventory.inventoryitem",
            ),
        ),
        migrations.AddField(
            model_name="sale",
            name="profit_percentage",
            field=models.DecimalField(decimal_places=4, default=0, max_digits=7),
        ),
        migrations.AddField(
            model_name="sale",
            name="sale_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="sale",
            name="sale_shipping_cost",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name="sale",
            name="sales_channel",
            field=models.CharField(
                choices=[
                    ("marketplace", "Marketplace"),
                    ("instagram", "Instagram"),
                    ("whatsapp", "WhatsApp"),
                    ("direct", "Directo"),
                    ("other", "Otro"),
                ],
                default="marketplace",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="sale",
            name="updated_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="sales_sale_updated",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="sale",
            name="client",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="sales",
                to="clients.client",
            ),
        ),
        migrations.AlterField(
            model_name="sale",
            name="created_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="sales_sale_created",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.RunPython(migrate_sales_data, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="sale",
            name="product",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="sales_records",
                to="inventory.inventoryitem",
            ),
        ),
        migrations.AlterField(
            model_name="sale",
            name="sale_date",
            field=models.DateField(),
        ),
        migrations.DeleteModel(name="SaleItem"),
    ]
