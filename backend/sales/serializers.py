from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from clients.models import Client
from inventory.models import InventoryItem

from .models import Sale, SaleItem


class SaleItemReadSerializer(serializers.ModelSerializer):
    inventory_item_id = serializers.IntegerField(source="inventory_item.id", read_only=True)
    inventory_item_name = serializers.CharField(source="inventory_item.name", read_only=True)
    inventory_item_sku = serializers.CharField(source="inventory_item.sku", read_only=True)

    class Meta:
        model = SaleItem
        fields = [
            "id",
            "inventory_item_id",
            "inventory_item_name",
            "inventory_item_sku",
            "quantity",
            "unit_price",
            "subtotal",
        ]


class SaleSerializer(serializers.ModelSerializer):
    client_id = serializers.IntegerField(source="client.id", read_only=True)
    client_name = serializers.CharField(source="client.name", read_only=True)
    created_by_id = serializers.IntegerField(source="created_by.id", read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    items = SaleItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = [
            "id",
            "client_id",
            "client_name",
            "created_by_id",
            "created_by_username",
            "total",
            "items",
            "created_at",
            "updated_at",
        ]


class SaleItemCreateSerializer(serializers.Serializer):
    inventory_item = serializers.IntegerField()


class SaleCreateSerializer(serializers.Serializer):
    client = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        required=False,
        allow_null=True,
    )
    items = SaleItemCreateSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one sale item is required.")
        if len(value) != 1:
            raise serializers.ValidationError("A sale must contain exactly one watch.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        client = validated_data.get("client")
        items_data = validated_data["items"]

        item_ids = [item["inventory_item"] for item in items_data]
        inventory_items = {
            item.id: item
            for item in InventoryItem.objects.select_for_update().filter(id__in=item_ids)
        }

        sale = Sale.objects.create(client=client, created_by=request.user, total=Decimal("0.00"))
        item_data = items_data[0]
        inventory_item_id = item_data["inventory_item"]
        quantity = 1

        inventory_item = inventory_items.get(inventory_item_id)
        if inventory_item is None:
            raise serializers.ValidationError(
                {"items": [f"Inventory item {inventory_item_id} does not exist."]}
            )

        if not inventory_item.is_active:
            raise serializers.ValidationError(
                {"items": [f"Inventory item {inventory_item.sku} is inactive."]}
            )

        if inventory_item.stock < quantity:
            raise serializers.ValidationError(
                {"items": [f"Inventory item {inventory_item.sku} has insufficient stock."]}
            )

        unit_price = inventory_item.price
        subtotal = unit_price * quantity

        inventory_item.stock -= quantity
        if inventory_item.stock == 0:
            inventory_item.status = InventoryItem.STATUS_SOLD
            inventory_item.is_active = False
            inventory_item.save(update_fields=["stock", "status", "is_active", "updated_at"])
        else:
            inventory_item.save(update_fields=["stock", "updated_at"])

        SaleItem.objects.create(
            sale=sale,
            inventory_item=inventory_item,
            quantity=quantity,
            unit_price=unit_price,
            subtotal=subtotal,
        )

        sale.total = subtotal
        sale.save(update_fields=["total", "updated_at"])
        sale.refresh_from_db()
        return sale

    def to_representation(self, instance):
        return SaleSerializer(instance, context=self.context).data
