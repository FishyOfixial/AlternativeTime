import django.core.validators
from django.db import migrations, models


def backfill_inventory_mockup_fields(apps, schema_editor):
    InventoryItem = apps.get_model("inventory", "InventoryItem")

    for item in InventoryItem.objects.all():
        if not item.model_name:
            item.model_name = item.name.replace(item.brand, "", 1).strip() or item.name
        if item.stock == 0:
            item.status = "sold"
            item.is_active = False
        elif not item.status:
            item.status = "available"
        item.save(
            update_fields=[
                "model_name",
                "status",
                "is_active",
            ]
        )


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0002_inventoryitem_brand_inventoryitem_cost_price"),
    ]

    operations = [
        migrations.AddField(
            model_name="inventoryitem",
            name="condition_score",
            field=models.DecimalField(
                decimal_places=1,
                default=0,
                max_digits=3,
                validators=[django.core.validators.MinValueValidator(0)],
            ),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="image_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="maintenance_cost",
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                max_digits=10,
                validators=[django.core.validators.MinValueValidator(0)],
            ),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="model_name",
            field=models.CharField(blank=True, max_length=180),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="payment_method",
            field=models.CharField(
                choices=[
                    ("cash", "Efectivo"),
                    ("transfer", "Transferencia"),
                    ("card", "Tarjeta"),
                    ("other", "Otro"),
                ],
                default="cash",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="provider",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="purchase_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="sales_channel",
            field=models.CharField(
                choices=[
                    ("marketplace", "Marketplace"),
                    ("instagram", "Instagram"),
                    ("whatsapp", "WhatsApp"),
                    ("store", "Tienda"),
                ],
                default="marketplace",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="shipping_cost",
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                max_digits=10,
                validators=[django.core.validators.MinValueValidator(0)],
            ),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="status",
            field=models.CharField(
                choices=[
                    ("available", "Disponible"),
                    ("reserved", "Apartado"),
                    ("sold", "Vendido"),
                ],
                default="available",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="tag",
            field=models.CharField(
                choices=[
                    ("none", "Sin etiqueta"),
                    ("new", "Nuevo"),
                    ("discount", "Descuento"),
                    ("promote", "Promover"),
                ],
                default="none",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="year_label",
            field=models.CharField(blank=True, max_length=80),
        ),
        migrations.RunPython(backfill_inventory_mockup_fields, migrations.RunPython.noop),
    ]
