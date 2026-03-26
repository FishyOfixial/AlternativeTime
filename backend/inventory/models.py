from datetime import datetime, time
from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone

from api.model_mixins import TimestampedSoftDeleteModel

BRAND_PREFIXES = {
    "hamilton": "HAM",
    "seiko": "SEI",
    "casio": "CAS",
    "g-shock": "G-S",
    "citizen": "CIT",
    "timex": "TIM",
    "tissot": "TIS",
    "omega": "OME",
    "orient": "ORI",
    "bulova": "BUL",
    "victorinox": "VIC",
    "rolex": "ROL",
    "cartier": "CAR",
}

PAYMENT_CHOICES = [
    ("cash", "Efectivo"),
    ("transfer", "Transferencia"),
    ("card", "Tarjeta"),
    ("msi", "MSI"),
    ("consignment", "Consigna"),
]

ACCOUNT_CHOICES = [
    ("cash", "Efectivo"),
    ("bbva", "BBVA"),
    ("credit", "Credito"),
    ("amex", "Amex"),
]


def get_brand_prefix(brand):
    normalized_brand = (brand or "").strip().lower()
    if not normalized_brand:
        return "ATC"
    return BRAND_PREFIXES.get(normalized_brand, normalized_brand[:3].upper())


def compute_age_tag(days_in_inventory):
    if days_in_inventory < 30:
        return InventoryItem.TAG_NEW
    if days_in_inventory < 60:
        return InventoryItem.TAG_PROMOTE
    if days_in_inventory < 90:
        return InventoryItem.TAG_DISCOUNT
    return InventoryItem.TAG_LIQUIDATE


class InventoryItem(TimestampedSoftDeleteModel):
    STATUS_AVAILABLE = "available"
    STATUS_RESERVED = "reserved"
    STATUS_SOLD = "sold"
    STATUS_CHOICES = [
        (STATUS_AVAILABLE, "Disponible"),
        (STATUS_RESERVED, "Apartado"),
        (STATUS_SOLD, "Vendido"),
    ]

    TAG_NEW = "new"
    TAG_PROMOTE = "promote"
    TAG_DISCOUNT = "discount"
    TAG_LIQUIDATE = "liquidate"
    TAG_CHOICES = [
        (TAG_NEW, "Nuevo"),
        (TAG_PROMOTE, "Promover"),
        (TAG_DISCOUNT, "Descuento"),
        (TAG_LIQUIDATE, "Liquidar"),
    ]

    CHANNEL_MARKETPLACE = "marketplace"
    CHANNEL_INSTAGRAM = "instagram"
    CHANNEL_WHATSAPP = "whatsapp"
    CHANNEL_DIRECT = "direct"
    CHANNEL_OTHER = "other"
    CHANNEL_CHOICES = [
        (CHANNEL_MARKETPLACE, "Marketplace"),
        (CHANNEL_INSTAGRAM, "Instagram"),
        (CHANNEL_WHATSAPP, "WhatsApp"),
        (CHANNEL_DIRECT, "Directo"),
        (CHANNEL_OTHER, "Otro"),
    ]

    product_id = models.CharField(max_length=12, unique=True, blank=True)
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=120)
    model_name = models.CharField(max_length=180)
    sku = models.CharField(max_length=100, unique=True, blank=True)
    year_label = models.CharField(max_length=80, blank=True)
    condition_score = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        default=1,
    )
    provider = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
    )
    shipping_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
    )
    maintenance_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
    )
    purchase_date = models.DateField()
    sold_at = models.DateTimeField(null=True, blank=True)
    sold_date = models.DateField(null=True, blank=True)
    days_to_sell = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_AVAILABLE,
    )
    tag = models.CharField(
        max_length=20,
        choices=TAG_CHOICES,
        default=TAG_NEW,
    )
    sales_channel = models.CharField(
        max_length=20,
        choices=CHANNEL_CHOICES,
        default=CHANNEL_MARKETPLACE,
        blank=True,
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES,
        default="cash",
    )
    image_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    stock = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.display_name} ({self.product_id or self.sku or self.pk})"

    @property
    def display_name(self):
        return " ".join(part for part in [self.brand, self.model_name] if part).strip() or self.name

    @property
    def dias_en_inventario(self):
        if self.status == self.STATUS_SOLD and self.days_to_sell is not None:
            return self.days_to_sell
        if self.status == self.STATUS_SOLD and self.sold_at and self.purchase_date:
            return max((timezone.localdate(self.sold_at) - self.purchase_date).days, 0)
        if not self.purchase_date:
            return 0
        return max((timezone.localdate() - self.purchase_date).days, 0)

    @property
    def etiqueta_antiguedad(self):
        return compute_age_tag(self.dias_en_inventario)

    @property
    def total_purchase_cost(self):
        if hasattr(self, "purchase_cost"):
            return self.purchase_cost.total_pagado
        return (
            (self.cost_price or Decimal("0.00"))
            + (self.shipping_cost or Decimal("0.00"))
            + (self.maintenance_cost or Decimal("0.00"))
        )

    @property
    def estimated_profit(self):
        return self.price - self.total_purchase_cost

    @property
    def utilidad(self):
        total_cost = self.total_purchase_cost
        if total_cost <= 0:
            return Decimal("0.00")
        return (self.estimated_profit / total_cost) * Decimal("100")

    def clean_runtime_state(self):
        if not self.purchase_date:
            self.purchase_date = timezone.localdate()
        self.name = self.display_name
        self.sku = self.product_id or self.sku
        if self.status == self.STATUS_SOLD:
            self.stock = 0
            self.is_active = False
            if self.sold_date and not self.sold_at:
                self.sold_at = timezone.make_aware(datetime.combine(self.sold_date, time.min))
        else:
            self.stock = 1
            self.is_active = True
            self.sold_at = None
            self.sold_date = None
            self.days_to_sell = None
        self.tag = self.etiqueta_antiguedad

    def save(self, *args, **kwargs):
        self.clean_runtime_state()
        if not self.product_id:
            self.product_id = generate_product_id(self.brand)
        if not self.sku:
            self.sku = self.product_id
        super().save(*args, **kwargs)


class PurchaseCost(models.Model):
    product = models.OneToOneField(
        InventoryItem,
        on_delete=models.CASCADE,
        related_name="purchase_cost",
    )
    purchase_date = models.DateField()
    watch_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
    )
    shipping_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
    )
    maintenance_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
    )
    other_costs = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
    )
    total_pagado = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES,
        default="cash",
    )
    source_account = models.CharField(
        max_length=20,
        choices=ACCOUNT_CHOICES,
        default="cash",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Costos {self.product.display_name}"

    def recalculate_total(self):
        self.total_pagado = (
            Decimal(str(self.watch_cost or "0.00"))
            + Decimal(str(self.shipping_cost or "0.00"))
            + Decimal(str(self.maintenance_cost or "0.00"))
            + Decimal(str(self.other_costs or "0.00"))
        )

    def save(self, *args, **kwargs):
        self.recalculate_total()
        if self.purchase_date != self.product.purchase_date:
            self.purchase_date = self.product.purchase_date
        super().save(*args, **kwargs)


def generate_product_id(brand):
    prefix = get_brand_prefix(brand)
    latest_item = InventoryItem.all_objects.filter(product_id__startswith=f"{prefix}-").order_by(
        "-product_id"
    ).first()
    if latest_item and "-" in latest_item.product_id:
        next_number = int(latest_item.product_id.split("-")[1]) + 1
    else:
        next_number = 1
    return f"{prefix}-{next_number:03d}"
