from django.db import migrations, models
from django.utils import timezone


def backfill_sold_at(apps, schema_editor):
    InventoryItem = apps.get_model("inventory", "InventoryItem")

    for item in InventoryItem.objects.filter(status="sold", sold_at__isnull=True):
        item.sold_at = item.updated_at or item.created_at or timezone.now()
        item.save(update_fields=["sold_at"])


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0003_inventoryitem_inventory_mockup_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="inventoryitem",
            name="sold_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(backfill_sold_at, migrations.RunPython.noop),
    ]
