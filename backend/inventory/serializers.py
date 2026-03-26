from decimal import Decimal

from rest_framework import serializers
from django.utils import timezone

from .models import InventoryItem


class InventoryItemSerializer(serializers.ModelSerializer):
    days_in_inventory = serializers.SerializerMethodField()
    total_cost = serializers.SerializerMethodField()
    estimated_profit = serializers.SerializerMethodField()
    estimated_margin = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        instance = getattr(self, "instance", None)

        name = attrs.get("name") or getattr(instance, "name", "")
        brand = attrs.get("brand")
        model_name = attrs.get("model_name") or getattr(instance, "model_name", "")
        cost_price = attrs.get("cost_price")
        shipping_cost = attrs.get("shipping_cost")
        maintenance_cost = attrs.get("maintenance_cost")
        status = attrs.get("status") or getattr(instance, "status", InventoryItem.STATUS_AVAILABLE)
        stock = attrs.get("stock")

        if brand is None or not str(brand).strip():
            attrs["brand"] = (name or "").split(" ")[0].strip() or "Sin marca"

        if not model_name:
            attrs["model_name"] = name.replace(attrs["brand"], "", 1).strip() or name

        attrs["name"] = " ".join(
            part for part in [attrs.get("brand", brand), attrs.get("model_name", model_name)] if part
        ).strip()

        if cost_price is None and instance is None:
            attrs["cost_price"] = attrs.get("price", Decimal("0.00"))

        if shipping_cost is None and instance is None:
            attrs["shipping_cost"] = Decimal("0.00")

        if maintenance_cost is None and instance is None:
            attrs["maintenance_cost"] = Decimal("0.00")

        if stock is None and instance is None:
            attrs["stock"] = 1

        if status == InventoryItem.STATUS_SOLD:
            attrs["stock"] = 0
            attrs["is_active"] = False
        else:
            attrs["stock"] = 1
            attrs["is_active"] = True

        return attrs

    def get_days_in_inventory(self, obj):
        reference_date = obj.purchase_date or timezone.localdate(obj.created_at)
        return max((timezone.localdate() - reference_date).days, 0)

    def get_total_cost(self, obj):
        return str((obj.cost_price or 0) + (obj.shipping_cost or 0) + (obj.maintenance_cost or 0))

    def get_estimated_profit(self, obj):
        total_cost = (obj.cost_price or 0) + (obj.shipping_cost or 0) + (obj.maintenance_cost or 0)
        return str((obj.price or 0) - total_cost)

    def get_estimated_margin(self, obj):
        total_cost = (obj.cost_price or 0) + (obj.shipping_cost or 0) + (obj.maintenance_cost or 0)
        if not obj.price:
            return 0
        return round(float(((obj.price - total_cost) / obj.price) * 100), 1)

    def get_display_name(self, obj):
        return " ".join(part for part in [obj.brand, obj.model_name] if part).strip() or obj.name

    class Meta:
        model = InventoryItem
        # Expose the full item payload while protecting generated fields.
        fields = [
            "id",
            "name",
            "display_name",
            "brand",
            "model_name",
            "sku",
            "year_label",
            "condition_score",
            "provider",
            "description",
            "price",
            "cost_price",
            "shipping_cost",
            "maintenance_cost",
            "payment_method",
            "purchase_date",
            "status",
            "tag",
            "sales_channel",
            "image_url",
            "stock",
            "is_active",
            "days_in_inventory",
            "total_cost",
            "estimated_profit",
            "estimated_margin",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "display_name",
            "days_in_inventory",
            "total_cost",
            "estimated_profit",
            "estimated_margin",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "name": {"required": False},
        }
