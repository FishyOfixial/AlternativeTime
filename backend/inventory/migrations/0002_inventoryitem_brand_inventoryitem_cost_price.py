from decimal import Decimal

import django.core.validators
from django.db import migrations, models


def backfill_inventory_brand_and_cost(apps, schema_editor):
    InventoryItem = apps.get_model("inventory", "InventoryItem")

    for item in InventoryItem.objects.all():
        item.brand = item.brand or ((item.name or "").split(" ")[0].strip() or "Sin marca")
        item.cost_price = item.cost_price or item.price or Decimal("0.00")
        item.save(update_fields=["brand", "cost_price"])


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="inventoryitem",
            name="brand",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="cost_price",
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                max_digits=10,
                validators=[django.core.validators.MinValueValidator(0)],
            ),
        ),
        migrations.RunPython(
            backfill_inventory_brand_and_cost,
            migrations.RunPython.noop,
        ),
    ]
