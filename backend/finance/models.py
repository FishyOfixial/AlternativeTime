from django.core.validators import MinValueValidator
from django.db import models

from api.model_mixins import TimestampedSoftDeleteModel


class FinanceEntry(TimestampedSoftDeleteModel):
    TYPE_INCOME = "income"
    TYPE_EXPENSE = "expense"
    TYPE_CHOICES = [
        (TYPE_INCOME, "Ingreso"),
        (TYPE_EXPENSE, "Egreso"),
    ]

    CONCEPT_SALE = "sale"
    CONCEPT_PURCHASE = "purchase"
    CONCEPT_CAPITAL_PAYMENT = "capital_payment"
    CONCEPT_LAYAWAY_PAYMENT = "layaway_payment"
    CONCEPT_TRANSFER = "transfer"
    CONCEPT_EXPENSE = "expense"
    CONCEPT_CHOICES = [
        (CONCEPT_SALE, "Venta"),
        (CONCEPT_PURCHASE, "Compra"),
        (CONCEPT_CAPITAL_PAYMENT, "Abono a capital"),
        (CONCEPT_LAYAWAY_PAYMENT, "Cobro de apartado"),
        (CONCEPT_TRANSFER, "Transferencia"),
        (CONCEPT_EXPENSE, "Gasto"),
    ]

    ACCOUNT_CASH = "cash"
    ACCOUNT_BBVA = "bbva"
    ACCOUNT_CREDIT = "credit"
    ACCOUNT_AMEX = "amex"
    ACCOUNT_CHOICES = [
        (ACCOUNT_CASH, "Efectivo"),
        (ACCOUNT_BBVA, "BBVA"),
        (ACCOUNT_CREDIT, "Credito"),
        (ACCOUNT_AMEX, "Amex"),
    ]

    entry_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    concept = models.CharField(max_length=20, choices=CONCEPT_CHOICES)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    account = models.CharField(max_length=20, choices=ACCOUNT_CHOICES)
    entry_date = models.DateField()
    is_automatic = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    product = models.ForeignKey(
        "inventory.InventoryItem",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="finance_entries",
    )
    sale = models.ForeignKey(
        "sales.Sale",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="finance_entries",
    )

    class Meta:
        ordering = ["-entry_date", "-created_at"]


class AccountBalance(models.Model):
    account = models.CharField(max_length=20, choices=FinanceEntry.ACCOUNT_CHOICES, unique=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["account"]
