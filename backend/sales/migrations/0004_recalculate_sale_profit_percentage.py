from decimal import Decimal

from django.db import migrations


def recalculate_sale_profit_percentage(apps, schema_editor):
    Sale = apps.get_model("sales", "Sale")
    db_alias = schema_editor.connection.alias

    for sale in Sale.objects.using(db_alias).all():
        amount_paid = sale.amount_paid or Decimal("0.00")
        gross_profit = sale.gross_profit or Decimal("0.00")
        sale.profit_percentage = (
            gross_profit / amount_paid if amount_paid > 0 else Decimal("0.0000")
        )
        sale.save(update_fields=["profit_percentage"])


class Migration(migrations.Migration):
    dependencies = [
        ("sales", "0003_alter_sale_options_alter_sale_amount_paid_and_more"),
    ]

    operations = [
        migrations.RunPython(recalculate_sale_profit_percentage, migrations.RunPython.noop),
    ]
