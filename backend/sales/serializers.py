from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from clients.models import Client
from finance.services import infer_destination_account, sync_sale_finance_entry
from inventory.models import InventoryItem

from .models import Sale


class SaleSerializer(serializers.ModelSerializer):
    customer = serializers.IntegerField(source="client.id", read_only=True)
    customer_id = serializers.IntegerField(source="client.id", read_only=True)
    customer_name = serializers.CharField(read_only=True)
    customer_contact = serializers.CharField(read_only=True)
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    product_label = serializers.CharField(source="product.display_name", read_only=True)
    product_code = serializers.CharField(source="product.product_id", read_only=True)
    created_by_id = serializers.IntegerField(source="created_by.id", read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Sale
        fields = [
            "id",
            "customer",
            "customer_id",
            "customer_name",
            "customer_contact",
            "product",
            "product_id",
            "product_label",
            "product_code",
            "sale_date",
            "payment_method",
            "sales_channel",
            "amount_paid",
            "extras",
            "sale_shipping_cost",
            "cost_snapshot",
            "gross_profit",
            "profit_percentage",
            "notes",
            "created_by_id",
            "created_by_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "customer_id",
            "customer_name",
            "customer_contact",
            "product_id",
            "product_label",
            "product_code",
            "cost_snapshot",
            "gross_profit",
            "profit_percentage",
            "created_by_id",
            "created_by_username",
            "created_at",
            "updated_at",
        ]


class SaleCreateSerializer(serializers.ModelSerializer):
    customer = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        required=False,
        allow_null=True,
        source="client",
    )
    product = serializers.PrimaryKeyRelatedField(queryset=InventoryItem.objects.all())

    class Meta:
        model = Sale
        fields = [
            "customer",
            "product",
            "sale_date",
            "customer_name",
            "customer_contact",
            "payment_method",
            "sales_channel",
            "amount_paid",
            "extras",
            "sale_shipping_cost",
            "notes",
        ]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        product = attrs["product"]
        sale_date = attrs["sale_date"]
        customer = attrs.get("client")
        customer_name = (attrs.get("customer_name") or "").strip()

        if sale_date > timezone.localdate():
            raise serializers.ValidationError({"sale_date": "No se permiten ventas futuras."})
        if sale_date < product.purchase_date:
            raise serializers.ValidationError({"sale_date": "La venta no puede ser anterior a la compra."})
        if product.status == InventoryItem.STATUS_SOLD:
            raise serializers.ValidationError({"product": "Este reloj ya fue vendido."})
        if Sale.objects.filter(product=product).exclude(pk=getattr(self.instance, "pk", None)).exists():
            raise serializers.ValidationError({"product": "Este reloj ya tiene una venta registrada."})
        if not customer and not customer_name:
            raise serializers.ValidationError(
                {"customer_name": "Debes indicar un cliente o al menos un nombre libre."}
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        product = validated_data["product"]
        cost_snapshot = product.total_purchase_cost

        sale = Sale.objects.create(
            **validated_data,
            cost_snapshot=cost_snapshot,
            created_by=user,
            updated_by=user,
        )

        product.status = InventoryItem.STATUS_SOLD
        product.sold_date = sale.sale_date
        product.sold_at = timezone.now()
        product.days_to_sell = max((sale.sale_date - product.purchase_date).days, 0)
        product.updated_by = user
        product.save()

        sync_sale_finance_entry(sale)
        sale.refresh_from_db()
        return sale

    def to_representation(self, instance):
        return SaleSerializer(instance, context=self.context).data
