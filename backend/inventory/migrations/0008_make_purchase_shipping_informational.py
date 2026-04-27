from decimal import Decimal

from django.db import migrations


def recalculate_account_balance(FinanceEntry, AccountBalance, account, db_alias):
    income_total = sum(
        entry.amount
        for entry in FinanceEntry.objects.using(db_alias).filter(
            account=account,
            entry_type="income",
            is_deleted=False,
        )
    )
    expense_total = sum(
        entry.amount
        for entry in FinanceEntry.objects.using(db_alias).filter(
            account=account,
            entry_type="expense",
            is_deleted=False,
        )
    )
    balance, _ = AccountBalance.objects.using(db_alias).get_or_create(account=account)
    balance.balance = income_total - expense_total
    balance.save(update_fields=["balance", "updated_at"])


def make_purchase_shipping_informational(apps, schema_editor):
    PurchaseCost = apps.get_model("inventory", "PurchaseCost")
    PurchaseCostLine = apps.get_model("inventory", "PurchaseCostLine")
    FinanceEntry = apps.get_model("finance", "FinanceEntry")
    AccountBalance = apps.get_model("finance", "AccountBalance")
    db_alias = schema_editor.connection.alias
    touched_accounts = set()

    for purchase_cost in PurchaseCost.objects.using(db_alias).all():
        purchase_cost.total_pagado = (
            Decimal(str(purchase_cost.watch_cost or "0.00"))
            + Decimal(str(purchase_cost.maintenance_cost or "0.00"))
            + Decimal(str(purchase_cost.other_costs or "0.00"))
        )
        purchase_cost.save(update_fields=["total_pagado", "updated_at"])

    shipping_lines = PurchaseCostLine.objects.using(db_alias).filter(
        cost_type="shipping",
        finance_entry__isnull=False,
    ).select_related("finance_entry")
    for cost_line in shipping_lines:
        finance_entry = cost_line.finance_entry
        touched_accounts.add(finance_entry.account)
        finance_entry.is_deleted = True
        finance_entry.save(update_fields=["is_deleted", "updated_at"])
        cost_line.finance_entry_id = None
        cost_line.save(update_fields=["finance_entry", "updated_at"])

    for account in touched_accounts:
        recalculate_account_balance(FinanceEntry, AccountBalance, account, db_alias)


class Migration(migrations.Migration):
    dependencies = [
        ("finance", "0004_alter_financeentry_concept"),
        ("inventory", "0007_purchasecostline"),
    ]

    operations = [
        migrations.RunPython(make_purchase_shipping_informational, migrations.RunPython.noop),
    ]
