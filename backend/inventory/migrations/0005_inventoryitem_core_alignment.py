from datetime import datetime, time
from decimal import Decimal

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone


BRAND_PREFIXES = {
    "hamilton": "HAM",
    "seiko": "SEI",
    "casio": "CAS",
    "g-shock": "G-S",
    "citizen": "CIT",
    "timex": "TIM",
    "tissot": "TIS",
    "omega": "OME",
    "orient": "ORI",
    "bulova": "BUL",
    "victorinox": "VIC",
    "rolex": "ROL",
    "cartier": "CAR",
}


def get_prefix(brand):
    normalized = (brand or "").strip().lower()
    if not normalized:
        return "ATC"
    return BRAND_PREFIXES.get(normalized, normalized[:3].upper())


def build_product_id(existing_ids, brand):
    prefix = get_prefix(brand)
    matches = []
    for product_id in existing_ids:
        if product_id and product_id.startswith(f"{prefix}-") and "-" in product_id:
            matches.append(int(product_id.split("-")[1]))
    next_number = max(matches, default=0) + 1
    return f"{prefix}-{next_number:03d}"


def compute_tag(days):
    if days < 30:
        return "new"
    if days < 60:
        return "promote"
    if days < 90:
        return "discount"
    return "liquidate"


def align_inventory_data(apps, schema_editor):
    InventoryItem = apps.get_model("inventory", "InventoryItem")
    PurchaseCost = apps.get_model("inventory", "PurchaseCost")
    db_alias = schema_editor.connection.alias
    existing_ids = list(
        InventoryItem.objects.using(db_alias).exclude(product_id__isnull=True).values_list(
            "product_id", flat=True
        )
    )

    for item in InventoryItem.objects.using(db_alias).all():
        if not item.brand:
            item.brand = (item.name or "").split(" ")[0].strip() or "Sin marca"
        if not item.model_name:
            item.model_name = item.name.replace(item.brand, "", 1).strip() or item.name
        item.name = " ".join(part for part in [item.brand, item.model_name] if part).strip()
        if not item.purchase_date:
            item.purchase_date = timezone.localdate(item.created_at)
        if not item.product_id:
            item.product_id = build_product_id(existing_ids, item.brand)
            existing_ids.append(item.product_id)
        item.sku = item.product_id
        if item.status == "sold":
            sold_reference = item.sold_at or item.updated_at or item.created_at
            item.sold_at = sold_reference
            item.sold_date = timezone.localdate(sold_reference)
            item.days_to_sell = max((item.sold_date - item.purchase_date).days, 0)
            item.stock = 0
            item.is_active = False
        else:
            item.stock = 1
            item.is_active = True
            item.sold_date = None
            item.days_to_sell = None
        days = item.days_to_sell if item.days_to_sell is not None else max(
            (timezone.localdate() - item.purchase_date).days,
            0,
        )
        item.tag = compute_tag(days)
        item.save()

        PurchaseCost.objects.using(db_alias).update_or_create(
            product=item,
            defaults={
                "purchase_date": item.purchase_date,
                "watch_cost": item.cost_price or Decimal("0.00"),
                "shipping_cost": item.shipping_cost or Decimal("0.00"),
                "maintenance_cost": item.maintenance_cost or Decimal("0.00"),
                "other_costs": Decimal("0.00"),
                "total_pagado": (
                    (item.cost_price or Decimal("0.00"))
                    + (item.shipping_cost or Decimal("0.00"))
                    + (item.maintenance_cost or Decimal("0.00"))
                ),
                "payment_method": item.payment_method or "cash",
                "source_account": "cash",
                "notes": "",
            },
        )


class Migration(migrations.Migration):
    dependencies = [
        ("inventory", "0004_inventoryitem_sold_at"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="inventoryitem",
            name="created_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="inventory_inventoryitem_created",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="days_to_sell",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="is_deleted",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="notes",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="product_id",
            field=models.CharField(blank=True, max_length=12, null=True),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="sold_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="updated_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="inventory_inventoryitem_updated",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.CreateModel(
            name="PurchaseCost",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("purchase_date", models.DateField()),
                ("watch_cost", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("shipping_cost", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("maintenance_cost", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("other_costs", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("total_pagado", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
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
                (
                    "source_account",
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
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "product",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="purchase_cost",
                        to="inventory.inventoryitem",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.RunPython(align_inventory_data, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="inventoryitem",
            name="brand",
            field=models.CharField(max_length=120),
        ),
        migrations.AlterField(
            model_name="inventoryitem",
            name="condition_score",
            field=models.DecimalField(decimal_places=1, default=1, max_digits=3),
        ),
        migrations.AlterField(
            model_name="inventoryitem",
            name="model_name",
            field=models.CharField(max_length=180),
        ),
        migrations.AlterField(
            model_name="inventoryitem",
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
        migrations.AlterField(
            model_name="inventoryitem",
            name="product_id",
            field=models.CharField(blank=True, max_length=12, unique=True),
        ),
        migrations.AlterField(
            model_name="inventoryitem",
            name="purchase_date",
            field=models.DateField(),
        ),
        migrations.AlterField(
            model_name="inventoryitem",
            name="sales_channel",
            field=models.CharField(
                blank=True,
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
        migrations.AlterField(
            model_name="inventoryitem",
            name="stock",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AlterField(
            model_name="inventoryitem",
            name="tag",
            field=models.CharField(
                choices=[
                    ("new", "Nuevo"),
                    ("promote", "Promover"),
                    ("discount", "Descuento"),
                    ("liquidate", "Liquidar"),
                ],
                default="new",
                max_length=20,
            ),
        ),
    ]
