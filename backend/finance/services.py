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
    finance_entry, _ = FinanceEntry.all_objects.update_or_create(
        sale=sale,
        concept=FinanceEntry.CONCEPT_SALE,
        defaults={
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
        },
    )
    recalculate_account_balance(finance_entry.account)
    return finance_entry


def sync_purchase_finance_entry(product):
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


def sync_layaway_payment_finance_entry(payment, user=None):
    from layaways.models import LayawayPayment

    if not isinstance(payment, LayawayPayment):
        raise TypeError("payment must be a LayawayPayment instance")

    finance_entry, _ = FinanceEntry.all_objects.update_or_create(
        layaway_payment=payment,
        defaults={
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
        },
    )
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
