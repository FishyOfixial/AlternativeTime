from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Sum
from django.utils import timezone

from api.model_mixins import TimestampedSoftDeleteModel
from finance.models import FinanceEntry
from inventory.models import PAYMENT_CHOICES


class Layaway(TimestampedSoftDeleteModel):
    STATUS_ACTIVE = "active"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Activo"),
        (STATUS_COMPLETED, "Completado"),
        (STATUS_CANCELLED, "Cancelado"),
    ]

    client = models.ForeignKey(
        "clients.Client",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="layaways",
    )
    product = models.ForeignKey(
        "inventory.InventoryItem",
        on_delete=models.PROTECT,
        related_name="layaways",
    )
    sale = models.OneToOneField(
        "sales.Sale",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="layaway_record",
    )
    customer_name = models.CharField(max_length=120, blank=True)
    customer_contact = models.CharField(max_length=80, blank=True)
    agreed_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    amount_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    balance_due = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    start_date = models.DateField(default=timezone.localdate)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-start_date", "-created_at"]

    def __str__(self):
        return f"Apartado #{self.pk} - {self.product.display_name}"

    @property
    def is_overdue(self):
        return bool(
            self.status == self.STATUS_ACTIVE
            and self.due_date
            and self.due_date < timezone.localdate()
            and self.balance_due > 0
        )

    def sync_customer_snapshot(self):
        if self.client_id:
            self.customer_name = self.client.name
            self.customer_contact = self.client.phone or self.client.instagram_handle or ""

    def recalculate_totals(self):
        paid = self.payments.filter(is_deleted=False).aggregate(total=Sum("amount"))["total"] or Decimal(
            "0.00"
        )
        self.amount_paid = paid
        self.balance_due = max((self.agreed_price or Decimal("0.00")) - paid, Decimal("0.00"))

    def save(self, *args, **kwargs):
        self.sync_customer_snapshot()
        if self.pk:
            self.recalculate_totals()
        else:
            self.amount_paid = Decimal(self.amount_paid or Decimal("0.00"))
            self.balance_due = max(
                Decimal(self.agreed_price or Decimal("0.00")) - self.amount_paid,
                Decimal("0.00"),
            )
        super().save(*args, **kwargs)


class LayawayPayment(TimestampedSoftDeleteModel):
    layaway = models.ForeignKey(
        Layaway,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    payment_date = models.DateField(default=timezone.localdate)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="cash")
    account = models.CharField(
        max_length=20,
        choices=FinanceEntry.ACCOUNT_CHOICES,
        default=FinanceEntry.ACCOUNT_CASH,
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["payment_date", "created_at"]

    def __str__(self):
        return f"Abono #{self.pk} - Apartado #{self.layaway_id}"
