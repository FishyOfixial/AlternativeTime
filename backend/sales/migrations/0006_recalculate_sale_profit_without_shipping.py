from decimal import Decimal

from django.db import migrations


def recalculate_sale_profit_without_shipping(apps, schema_editor):
    Sale = apps.get_model("sales", "Sale")
    for sale in Sale.objects.all():
        amount_paid = sale.amount_paid or Decimal("0.00")
        sale.gross_profit = (
            amount_paid
            - (sale.cost_snapshot or Decimal("0.00"))
            - (sale.extras or Decimal("0.00"))
        )
        sale.profit_percentage = (
            sale.gross_profit / amount_paid if amount_paid > 0 else Decimal("0.0000")
        )
        sale.save(update_fields=["gross_profit", "profit_percentage"])


class Migration(migrations.Migration):
    dependencies = [
        ("sales", "0005_sale_account_fields"),
    ]

    operations = [
        migrations.RunPython(
            recalculate_sale_profit_without_shipping,
            migrations.RunPython.noop,
        ),
    ]
