from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers

from .models import AccountBalance, FinanceEntry


def recalculate_account_balance(account):
    income_total = sum(
        entry.amount
        for entry in FinanceEntry.objects.filter(
            account=account,
            entry_type=FinanceEntry.TYPE_INCOME,
            is_deleted=False,
        )
    )
    expense_total = sum(
        entry.amount
        for entry in FinanceEntry.objects.filter(
            account=account,
            entry_type=FinanceEntry.TYPE_EXPENSE,
            is_deleted=False,
        )
    )
    balance, _ = AccountBalance.objects.get_or_create(account=account)
    balance.balance = income_total - expense_total
    balance.save(update_fields=["balance", "updated_at"])
    return balance


def infer_destination_account(payment_method):
    mappings = {
        "cash": FinanceEntry.ACCOUNT_CASH,
        "transfer": FinanceEntry.ACCOUNT_BBVA,
        "card": FinanceEntry.ACCOUNT_CREDIT,
        "msi": FinanceEntry.ACCOUNT_CREDIT,
        "consignment": FinanceEntry.ACCOUNT_AMEX,
    }
    return mappings.get(payment_method, FinanceEntry.ACCOUNT_CASH)


def infer_payment_method_from_account(account):
    mappings = {
        FinanceEntry.ACCOUNT_CASH: "cash",
        FinanceEntry.ACCOUNT_BBVA: "transfer",
        FinanceEntry.ACCOUNT_CREDIT: "card",
        FinanceEntry.ACCOUNT_AMEX: "consignment",
    }
    return mappings.get(account, "cash")


def sync_sale_finance_entry(sale):
    sale_entries = FinanceEntry.all_objects.filter(
        sale=sale,
        concept=FinanceEntry.CONCEPT_SALE,
    ).order_by("is_deleted", "id")
    finance_entry = sale_entries.first()
    previous_accounts = set(sale_entries.values_list("account", flat=True))
    defaults = {
        "entry_type": FinanceEntry.TYPE_INCOME,
        "amount": sale.amount_paid,
        "account": infer_destination_account(sale.payment_method),
        "entry_date": sale.sale_date,
        "product": sale.product,
        "notes": sale.notes,
        "created_by": sale.created_by,
        "updated_by": sale.updated_by,
        "is_automatic": True,
        "is_deleted": False,
    }

    if finance_entry:
        for field, value in defaults.items():
            setattr(finance_entry, field, value)
        finance_entry.save()
        sale_entries.exclude(pk=finance_entry.pk).update(
            is_deleted=True,
            updated_by=sale.updated_by,
        )
    else:
        finance_entry = FinanceEntry.objects.create(
            sale=sale,
            concept=FinanceEntry.CONCEPT_SALE,
            **defaults,
        )

    previous_accounts.add(finance_entry.account)
    for account in previous_accounts:
        recalculate_account_balance(account)
    return finance_entry


def sync_purchase_finance_entry(product):
    from inventory.models import PurchaseCostLine

    if product.purchase_cost_lines.filter(is_deleted=False).exists():
        linked_lines = product.purchase_cost_lines.filter(is_deleted=False, finance_entry__isnull=False)
        entries = [sync_purchase_cost_line_finance_entry(cost_line) for cost_line in linked_lines]
        return entries[0] if entries else None

    purchase_cost = getattr(product, "purchase_cost", None)
    if purchase_cost is None:
        raise serializers.ValidationError({"product": "El reloj no tiene costos de compra asociados."})

    finance_entry, _ = FinanceEntry.all_objects.update_or_create(
        product=product,
        concept=FinanceEntry.CONCEPT_PURCHASE,
        defaults={
            "entry_type": FinanceEntry.TYPE_EXPENSE,
            "amount": purchase_cost.total_pagado,
            "account": purchase_cost.source_account,
            "entry_date": purchase_cost.purchase_date,
            "notes": purchase_cost.notes,
            "is_automatic": True,
            "created_by": product.created_by,
            "updated_by": product.updated_by,
            "is_deleted": False,
        },
    )
    recalculate_account_balance(finance_entry.account)
    return finance_entry


def sync_purchase_cost_line_finance_entry(cost_line):
    old_account = cost_line.finance_entry.account if cost_line.finance_entry_id else None

    if cost_line.amount <= 0:
        if cost_line.finance_entry_id:
            finance_entry = cost_line.finance_entry
            finance_entry.is_deleted = True
            finance_entry.updated_by = cost_line.updated_by
            finance_entry.save(update_fields=["is_deleted", "updated_by", "updated_at"])
            recalculate_account_balance(finance_entry.account)
        return None

    defaults = {
        "entry_type": FinanceEntry.TYPE_EXPENSE,
        "concept": FinanceEntry.CONCEPT_PURCHASE,
        "amount": cost_line.amount,
        "account": cost_line.account,
        "entry_date": cost_line.cost_date,
        "notes": cost_line.notes,
        "product": cost_line.product,
        "is_automatic": True,
        "created_by": cost_line.created_by or cost_line.product.created_by,
        "updated_by": cost_line.updated_by or cost_line.product.updated_by,
        "is_deleted": False,
    }

    if cost_line.finance_entry_id:
        finance_entry = cost_line.finance_entry
        for field, value in defaults.items():
            setattr(finance_entry, field, value)
        finance_entry.save()
    else:
        finance_entry = FinanceEntry.objects.create(**defaults)
        cost_line.finance_entry = finance_entry
        cost_line.save(update_fields=["finance_entry", "updated_at"])

    if old_account and old_account != finance_entry.account:
        recalculate_account_balance(old_account)
    recalculate_account_balance(finance_entry.account)
    return finance_entry


def delete_purchase_cost_line_relationship(cost_line, user):
    finance_entry = cost_line.finance_entry
    cost_line.is_deleted = True
    cost_line.updated_by = user
    cost_line.save(update_fields=["is_deleted", "updated_by", "updated_at"])

    if finance_entry is not None:
        finance_entry.is_deleted = True
        finance_entry.updated_by = user
        finance_entry.save(update_fields=["is_deleted", "updated_by", "updated_at"])
        recalculate_account_balance(finance_entry.account)

    return True


def sync_layaway_payment_finance_entry(payment, user=None):
    from layaways.models import LayawayPayment

    if not isinstance(payment, LayawayPayment):
        raise TypeError("payment must be a LayawayPayment instance")

    defaults = {
        "entry_type": FinanceEntry.TYPE_INCOME,
        "concept": FinanceEntry.CONCEPT_LAYAWAY_PAYMENT,
        "amount": payment.amount,
        "account": payment.account,
        "entry_date": payment.payment_date,
        "is_automatic": True,
        "notes": payment.notes,
        "product": payment.layaway.product,
        "created_by": payment.created_by,
        "updated_by": user or payment.updated_by,
        "is_deleted": False,
    }
    if payment.finance_entry_id:
        finance_entry = payment.finance_entry
        for field, value in defaults.items():
            setattr(finance_entry, field, value)
        finance_entry.save()
    else:
        finance_entry = FinanceEntry.objects.create(**defaults)
    if payment.finance_entry_id != finance_entry.id:
        payment.finance_entry = finance_entry
        payment.save(update_fields=["finance_entry"])
    recalculate_account_balance(finance_entry.account)
    return finance_entry


def reconcile_layaway_completion(layaway, user):
    from inventory.models import InventoryItem
    from sales.models import Sale

    layaway.refresh_from_db()
    latest_payment = (
        layaway.payments.filter(is_deleted=False).order_by("-payment_date", "-created_at").first()
    )
    product = layaway.product

    if layaway.balance_due <= 0:
        if latest_payment is None:
            return layaway

        if layaway.sale_id:
            sale = layaway.sale
            sale.sale_date = latest_payment.payment_date
            sale.payment_method = latest_payment.payment_method
            sale.amount_paid = layaway.agreed_price
            sale.notes = f"Apartado completado #{layaway.id}"
            sale.updated_by = user
            sale.is_deleted = False
            sale.save()
        else:
            sale = Sale.objects.create(
                client=layaway.client,
                product=product,
                sale_date=latest_payment.payment_date,
                customer_name=layaway.customer_name,
                customer_contact=layaway.customer_contact,
                payment_method=latest_payment.payment_method,
                sales_channel=InventoryItem.CHANNEL_DIRECT,
                amount_paid=layaway.agreed_price,
                extras=Decimal("0.00"),
                sale_shipping_cost=Decimal("0.00"),
                cost_snapshot=product.total_purchase_cost,
                notes=f"Apartado completado #{layaway.id}",
                created_by=user,
                updated_by=user,
            )

        product.status = InventoryItem.STATUS_SOLD
        product.sold_date = sale.sale_date
        product.sold_at = timezone.now()
        product.days_to_sell = max((sale.sale_date - product.purchase_date).days, 0)
        product.updated_by = user
        product.save(
            update_fields=[
                "status",
                "sold_date",
                "sold_at",
                "days_to_sell",
                "updated_by",
                "updated_at",
                "stock",
                "is_active",
                "tag",
            ]
        )

        layaway.status = layaway.STATUS_COMPLETED
        layaway.sale = sale
        layaway.updated_by = user
        layaway.save(update_fields=["status", "sale", "updated_by", "updated_at"])
        return layaway

    if layaway.sale_id:
        sale = layaway.sale
        sale.is_deleted = True
        sale.updated_by = user
        sale.save(update_fields=["is_deleted", "updated_by", "updated_at"])
        layaway.sale = None

    product.status = InventoryItem.STATUS_RESERVED
    product.sold_date = None
    product.sold_at = None
    product.days_to_sell = None
    product.updated_by = user
    product.save(
        update_fields=[
            "status",
            "sold_date",
            "sold_at",
            "days_to_sell",
            "updated_by",
            "updated_at",
            "stock",
            "is_active",
            "tag",
        ]
    )

    layaway.status = layaway.STATUS_ACTIVE
    layaway.updated_by = user
    layaway.save(update_fields=["status", "sale", "updated_by", "updated_at"])
    return layaway


def delete_sale_relationship(finance_entry, user):
    from inventory.models import InventoryItem

    sale = finance_entry.sale
    if sale is None:
        return False

    product = sale.product
    sale.is_deleted = True
    sale.updated_by = user
    sale.save(update_fields=["is_deleted", "updated_by", "updated_at"])

    if product is not None:
        product.status = InventoryItem.STATUS_AVAILABLE
        product.sold_date = None
        product.sold_at = None
        product.days_to_sell = None
        product.updated_by = user
        product.save(
            update_fields=[
                "status",
                "sold_date",
                "sold_at",
                "days_to_sell",
                "updated_by",
                "updated_at",
                "stock",
                "is_active",
                "tag",
            ]
        )

    finance_entry.is_deleted = True
    finance_entry.updated_by = user
    finance_entry.save(update_fields=["is_deleted", "updated_by", "updated_at"])
    recalculate_account_balance(finance_entry.account)
    return True


def delete_purchase_relationship(finance_entry, user):
    cost_line = getattr(finance_entry, "purchase_cost_line", None)
    if cost_line is not None:
        return delete_purchase_cost_line_relationship(cost_line, user)

    product = finance_entry.product
    purchase_cost = getattr(product, "purchase_cost", None) if product else None
    if purchase_cost is None:
        return False

    purchase_cost.delete()
    finance_entry.is_deleted = True
    finance_entry.updated_by = user
    finance_entry.save(update_fields=["is_deleted", "updated_by", "updated_at"])

    if product is not None:
        product.updated_by = user
        product.save(update_fields=["updated_by", "updated_at"])

    recalculate_account_balance(finance_entry.account)
    return True


def delete_layaway_payment_relationship(finance_entry, user):
    payment = getattr(finance_entry, "layaway_payment", None)
    if payment is None:
        return False

    layaway = payment.layaway
    payment.is_deleted = True
    payment.updated_by = user
    payment.save(update_fields=["is_deleted", "updated_by", "updated_at"])

    finance_entry.is_deleted = True
    finance_entry.updated_by = user
    finance_entry.save(update_fields=["is_deleted", "updated_by", "updated_at"])

    layaway.updated_by = user
    layaway.save()
    reconcile_layaway_completion(layaway, user)
    recalculate_account_balance(finance_entry.account)
    return True
