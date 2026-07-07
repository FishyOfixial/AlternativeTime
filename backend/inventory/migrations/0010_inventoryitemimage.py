from django.db import migrations, models
import django.db.models.deletion
import inventory.models


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0009_inventoryitem_catalog_fields"),
    ]

    operations = [
        migrations.CreateModel(
            name="InventoryItemImage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "image",
                    models.ImageField(
                        upload_to="watches/gallery/%Y/%m/",
                        validators=[inventory.models.validate_watch_image_size],
                    ),
                ),
                ("position", models.PositiveSmallIntegerField(default=0)),
                ("alt_text", models.CharField(blank=True, max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="catalog_images",
                        to="inventory.inventoryitem",
                    ),
                ),
            ],
            options={
                "ordering": ["position", "id"],
            },
        ),
        migrations.AddConstraint(
            model_name="inventoryitemimage",
            constraint=models.UniqueConstraint(
                fields=("product", "position"),
                name="unique_inventory_image_position",
            ),
        ),
    ]
