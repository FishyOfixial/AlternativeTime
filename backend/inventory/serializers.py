from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from finance.services import sync_purchase_finance_entry

from .models import InventoryItem, PurchaseCost


class PurchaseCostSerializer(serializers.ModelSerializer):
    total_pagado = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseCost
        fields = [
            "watch_cost",
            "shipping_cost",
            "maintenance_cost",
            "other_costs",
            "payment_method",
            "source_account",
            "notes",
            "total_pagado",
        ]


class InventoryItemSerializer(serializers.ModelSerializer):
    purchase_cost = PurchaseCostSerializer(required=False)
    display_name = serializers.CharField(read_only=True)
    days_in_inventory = serializers.IntegerField(source="dias_en_inventario", read_only=True)
    age_tag = serializers.CharField(source="etiqueta_antiguedad", read_only=True)
    total_cost = serializers.SerializerMethodField()
    estimated_profit = serializers.SerializerMethodField()
    utilidad = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "product_id",
            "sku",
            "name",
            "display_name",
            "brand",
            "model_name",
            "year_label",
            "condition_score",
            "provider",
            "description",
            "notes",
            "price",
            "purchase_date",
            "status",
            "tag",
            "age_tag",
            "sales_channel",
            "image_url",
            "sold_at",
            "sold_date",
            "days_to_sell",
            "stock",
            "is_active",
            "days_in_inventory",
            "total_cost",
            "estimated_profit",
            "utilidad",
            "purchase_cost",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "product_id",
            "sku",
            "name",
            "display_name",
            "tag",
            "age_tag",
            "sold_at",
            "sold_date",
            "days_to_sell",
            "stock",
            "is_active",
            "days_in_inventory",
            "total_cost",
            "estimated_profit",
            "utilidad",
            "created_at",
            "updated_at",
        ]

    def get_total_cost(self, obj):
        return str(obj.total_purchase_cost)

    def get_estimated_profit(self, obj):
        return str(obj.estimated_profit)

    def get_utilidad(self, obj):
        return round(float(obj.utilidad), 1)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        instance = getattr(self, "instance", None)
        if not attrs.get("brand"):
            name = attrs.get("name") or getattr(instance, "name", "")
            attrs["brand"] = (name.split(" ")[0].strip() if name else "") or "Sin marca"
        if not attrs.get("model_name"):
            name = attrs.get("name") or getattr(instance, "name", "")
            attrs["model_name"] = name.replace(attrs["brand"], "", 1).strip() or name or attrs["brand"]
        if not attrs.get("purchase_date"):
            attrs["purchase_date"] = getattr(instance, "purchase_date", None)
        price = attrs.get("price", getattr(self.instance, "price", Decimal("0.00")))
        if price <= 0:
            raise serializers.ValidationError({"price": "El precio de venta debe ser mayor a cero."})
        return attrs

    def _sync_purchase_cost(self, product, purchase_cost_data):
        purchase_cost, _ = PurchaseCost.objects.get_or_create(
            product=product,
            defaults={
                "purchase_date": product.purchase_date,
            },
        )
        for field, value in purchase_cost_data.items():
            setattr(purchase_cost, field, value)
        purchase_cost.purchase_date = product.purchase_date
        purchase_cost.save()
        sync_purchase_finance_entry(product)
        return purchase_cost

    @transaction.atomic
    def create(self, validated_data):
        purchase_cost_data = validated_data.pop("purchase_cost", None) or {
            "watch_cost": validated_data.get("cost_price", Decimal("0.00")),
            "shipping_cost": validated_data.get("shipping_cost", Decimal("0.00")),
            "maintenance_cost": validated_data.get("maintenance_cost", Decimal("0.00")),
            "other_costs": Decimal("0.00"),
            "payment_method": validated_data.get("payment_method", "cash"),
            "source_account": "cash",
            "notes": validated_data.get("notes", ""),
        }
        request = self.context.get("request")
        user = getattr(request, "user", None)
        product = InventoryItem.objects.create(
            **validated_data,
            created_by=user if getattr(user, "is_authenticated", False) else None,
            updated_by=user if getattr(user, "is_authenticated", False) else None,
        )
        self._sync_purchase_cost(product, purchase_cost_data)
        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        purchase_cost_data = validated_data.pop("purchase_cost", None)
        request = self.context.get("request")
        user = getattr(request, "user", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if getattr(user, "is_authenticated", False):
            instance.updated_by = user
        instance.save()
        if purchase_cost_data is None and any(
            key in validated_data for key in ["cost_price", "shipping_cost", "maintenance_cost", "payment_method"]
        ):
            purchase_cost_data = {
                "watch_cost": validated_data.get("cost_price", instance.cost_price),
                "shipping_cost": validated_data.get("shipping_cost", instance.shipping_cost),
                "maintenance_cost": validated_data.get("maintenance_cost", instance.maintenance_cost),
                "other_costs": getattr(getattr(instance, "purchase_cost", None), "other_costs", Decimal("0.00")),
                "payment_method": validated_data.get(
                    "payment_method",
                    getattr(getattr(instance, "purchase_cost", None), "payment_method", "cash"),
                ),
                "source_account": getattr(
                    getattr(instance, "purchase_cost", None), "source_account", "cash"
                ),
                "notes": getattr(getattr(instance, "purchase_cost", None), "notes", ""),
            }
        if purchase_cost_data is not None:
            self._sync_purchase_cost(instance, purchase_cost_data)
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["tag"] = data["age_tag"]
        return data
