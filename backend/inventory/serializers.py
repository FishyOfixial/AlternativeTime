from decimal import Decimal

from rest_framework import serializers

from .models import InventoryItem


class InventoryItemSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        attrs = super().validate(attrs)
        instance = getattr(self, "instance", None)

        name = attrs.get("name") or getattr(instance, "name", "")
        brand = attrs.get("brand")
        cost_price = attrs.get("cost_price")

        if brand is None or not str(brand).strip():
            attrs["brand"] = (name or "").split(" ")[0].strip() or "Sin marca"

        if cost_price is None and instance is None:
            attrs["cost_price"] = attrs.get("price", Decimal("0.00"))

        return attrs

    class Meta:
        model = InventoryItem
        # Expose the full item payload while protecting generated fields.
        fields = [
            "id",
            "name",
            "brand",
            "sku",
            "description",
            "price",
            "cost_price",
            "stock",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
