from django.db import migrations, models

import inventory.models


class Migration(migrations.Migration):
    dependencies = [
        ("inventory", "0008_make_purchase_shipping_informational"),
    ]

    operations = [
        migrations.AddField(
            model_name="inventoryitem",
            name="is_published",
            field=models.BooleanField(
                default=False,
                help_text="Muestra este reloj en el catálogo público.",
            ),
        ),
        migrations.AddField(
            model_name="inventoryitem",
            name="primary_image",
            field=models.ImageField(
                blank=True,
                upload_to="watches/%Y/%m/",
                validators=[inventory.models.validate_watch_image_size],
            ),
        ),
    ]
