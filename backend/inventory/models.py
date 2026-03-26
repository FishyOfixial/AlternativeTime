from django.core.validators import MinValueValidator
from django.db import models


class InventoryItem(models.Model):
    # Initial inventory entity for catalog and stock tracking.
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        # Price must remain non-negative from the model layer downward.
        validators=[MinValueValidator(0)],
    )
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Alphabetical ordering makes the resource easier to browse in the MVP.
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.sku})"
