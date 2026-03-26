from django.core.validators import MinValueValidator
from django.db import models


class InventoryItem(models.Model):
    STATUS_AVAILABLE = "available"
    STATUS_RESERVED = "reserved"
    STATUS_SOLD = "sold"
    STATUS_CHOICES = [
        (STATUS_AVAILABLE, "Disponible"),
        (STATUS_RESERVED, "Apartado"),
        (STATUS_SOLD, "Vendido"),
    ]

    TAG_NONE = "none"
    TAG_NEW = "new"
    TAG_DISCOUNT = "discount"
    TAG_PROMOTE = "promote"
    TAG_CHOICES = [
        (TAG_NONE, "Sin etiqueta"),
        (TAG_NEW, "Nuevo"),
        (TAG_DISCOUNT, "Descuento"),
        (TAG_PROMOTE, "Promover"),
    ]

    CHANNEL_MARKETPLACE = "marketplace"
    CHANNEL_INSTAGRAM = "instagram"
    CHANNEL_WHATSAPP = "whatsapp"
    CHANNEL_STORE = "store"
    CHANNEL_CHOICES = [
        (CHANNEL_MARKETPLACE, "Marketplace"),
        (CHANNEL_INSTAGRAM, "Instagram"),
        (CHANNEL_WHATSAPP, "WhatsApp"),
        (CHANNEL_STORE, "Tienda"),
    ]

    PAYMENT_CASH = "cash"
    PAYMENT_TRANSFER = "transfer"
    PAYMENT_CARD = "card"
    PAYMENT_OTHER = "other"
    PAYMENT_CHOICES = [
        (PAYMENT_CASH, "Efectivo"),
        (PAYMENT_TRANSFER, "Transferencia"),
        (PAYMENT_CARD, "Tarjeta"),
        (PAYMENT_OTHER, "Otro"),
    ]

    # Initial inventory entity for catalog and stock tracking.
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=120, blank=True)
    model_name = models.CharField(max_length=180, blank=True)
    sku = models.CharField(max_length=100, unique=True)
    year_label = models.CharField(max_length=80, blank=True)
    condition_score = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(0)],
        default=0,
    )
    provider = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        # Price must remain non-negative from the model layer downward.
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
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES,
        default=PAYMENT_CASH,
    )
    purchase_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_AVAILABLE,
    )
    tag = models.CharField(
        max_length=20,
        choices=TAG_CHOICES,
        default=TAG_NONE,
    )
    sales_channel = models.CharField(
        max_length=20,
        choices=CHANNEL_CHOICES,
        default=CHANNEL_MARKETPLACE,
    )
    image_url = models.URLField(blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Alphabetical ordering makes the resource easier to browse in the MVP.
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.sku})"
