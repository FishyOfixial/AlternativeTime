from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from api.model_mixins import TimestampedSoftDeleteModel
from clients.models import Client
from finance.models import FinanceEntry
from inventory.models import InventoryItem, PAYMENT_CHOICES


class Sale(TimestampedSoftDeleteModel):
    CHANNEL_MARKETPLACE = "marketplace"
    CHANNEL_INSTAGRAM = "instagram"
    CHANNEL_WHATSAPP = "whatsapp"
    CHANNEL_DIRECT = "direct"
    CHANNEL_OTHER = "other"
    CHANNEL_CHOICES = InventoryItem.CHANNEL_CHOICES

    client = models.ForeignKey(
        Client,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales",
    )
    product = models.ForeignKey(
        InventoryItem,
        on_delete=models.PROTECT,
        related_name="sales_records",
        null=True,
        blank=True,
    )
    sale_date = models.DateField()
    customer_name = models.CharField(max_length=120, blank=True)
    customer_contact = models.CharField(max_length=80, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    sales_channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    extras = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    sale_shipping_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    extras_account = models.CharField(
        max_length=20,
        choices=FinanceEntry.ACCOUNT_CHOICES,
        default=FinanceEntry.ACCOUNT_CASH,
    )
    sale_shipping_account = models.CharField(
        max_length=20,
        choices=FinanceEntry.ACCOUNT_CHOICES,
        default=FinanceEntry.ACCOUNT_CASH,
    )
    cost_snapshot = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gross_profit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    profit_percentage = models.DecimalField(max_digits=7, decimal_places=4, default=0)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-sale_date", "-created_at"]

    def __str__(self):
        product_label = self.product.display_name if self.product_id else f"venta-{self.pk}"
        return f"{product_label} - {self.amount_paid}"

    @property
    def customer(self):
        return self.client

    def sync_customer_snapshot(self):
        if self.client_id:
            self.customer_name = self.client.name
            self.customer_contact = self.client.phone or self.client.instagram_handle or ""

    def calculate_profit_fields(self):
        self.gross_profit = (
            (self.amount_paid or Decimal("0.00"))
            - (self.cost_snapshot or Decimal("0.00"))
            - (self.extras or Decimal("0.00"))
            - (self.sale_shipping_cost or Decimal("0.00"))
        )
        if self.amount_paid and self.amount_paid > 0:
            self.profit_percentage = self.gross_profit / self.amount_paid
        else:
            self.profit_percentage = Decimal("0.0000")

    def infer_expense_account(self):
        mappings = {
            "cash": FinanceEntry.ACCOUNT_CASH,
            "transfer": FinanceEntry.ACCOUNT_BBVA,
            "card": FinanceEntry.ACCOUNT_CREDIT,
            "msi": FinanceEntry.ACCOUNT_CREDIT,
            "consignment": FinanceEntry.ACCOUNT_AMEX,
        }
        return mappings.get(self.payment_method, FinanceEntry.ACCOUNT_CASH)

    def save(self, *args, **kwargs):
        self.sync_customer_snapshot()
        self.calculate_profit_fields()
        inferred_account = self.infer_expense_account()
        self.extras_account = self.extras_account or inferred_account
        self.sale_shipping_account = self.sale_shipping_account or inferred_account
        self.total = self.amount_paid
        super().save(*args, **kwargs)
