from decimal import Decimal

from django.db import migrations
from django.db.models import Sum


def product_cost_without_purchase_shipping(product_id, PurchaseCost, PurchaseCostLine, db_alias):
    line_total = (
        PurchaseCostLine.objects.using(db_alias)
        .filter(product_id=product_id, is_deleted=False)
        .exclude(cost_type="shipping")
        .aggregate(total=Sum("amount"))["total"]
    )
    if line_total is not None:
        return line_total

    purchase_cost = PurchaseCost.objects.using(db_alias).filter(product_id=product_id).first()
    if purchase_cost is not None:
        return purchase_cost.total_pagado or Decimal("0.00")

    return Decimal("0.00")


def recalculate_sale_costs_after_purchase_shipping(apps, schema_editor):
    Sale = apps.get_model("sales", "Sale")
    PurchaseCost = apps.get_model("inventory", "PurchaseCost")
    PurchaseCostLine = apps.get_model("inventory", "PurchaseCostLine")
    db_alias = schema_editor.connection.alias

    for sale in Sale.objects.using(db_alias).filter(product_id__isnull=False):
        sale.cost_snapshot = product_cost_without_purchase_shipping(
            sale.product_id,
            PurchaseCost,
            PurchaseCostLine,
            db_alias,
        )
        amount_paid = sale.amount_paid or Decimal("0.00")
        sale.gross_profit = (
            amount_paid
            - (sale.cost_snapshot or Decimal("0.00"))
            - (sale.extras or Decimal("0.00"))
            - (sale.sale_shipping_cost or Decimal("0.00"))
        )
        sale.profit_percentage = (
            sale.gross_profit / amount_paid if amount_paid > 0 else Decimal("0.0000")
        )
        sale.save(update_fields=["cost_snapshot", "gross_profit", "profit_percentage"])


class Migration(migrations.Migration):
    dependencies = [
        ("inventory", "0008_make_purchase_shipping_informational"),
        ("sales", "0006_recalculate_sale_profit_without_shipping"),
    ]

    operations = [
        migrations.RunPython(
            recalculate_sale_costs_after_purchase_shipping,
            migrations.RunPython.noop,
        ),
    ]
