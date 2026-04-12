from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from clients.models import Client
from finance.services import (
    deactivate_sale_finance_entries,
    infer_destination_account,
    reconcile_layaway_completion,
    sync_layaway_payment_finance_entry,
    sync_sale_finance_entry,
)
from inventory.models import InventoryItem
from layaways.models import Layaway

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
    product = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(),
        required=False,
        allow_null=True,
    )

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

    def _get_linked_layaway(self, sale):
        if not sale or not sale.pk:
            return None
        return Layaway.objects.select_related("product", "client", "sale").filter(sale=sale).first()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        product = attrs["product"] if "product" in attrs else getattr(self.instance, "product", None)
        sale_date = attrs.get("sale_date") or getattr(self.instance, "sale_date", None)
        customer = attrs.get("client", getattr(self.instance, "client", None))
        customer_name = (
            attrs.get("customer_name", getattr(self.instance, "customer_name", "")) or ""
        ).strip()

        if not self.instance and not product:
            raise serializers.ValidationError({"product": "Selecciona un reloj para vender."})
        if sale_date > timezone.localdate():
            raise serializers.ValidationError({"sale_date": "No se permiten ventas futuras."})
        if product and sale_date < product.purchase_date:
            raise serializers.ValidationError({"sale_date": "La venta no puede ser anterior a la compra."})
        is_current_sale_product = self.instance and self.instance.product_id == getattr(product, "id", None)
        if product and product.status == InventoryItem.STATUS_SOLD and not is_current_sale_product:
            raise serializers.ValidationError({"product": "Este reloj ya fue vendido."})
        if product and (
            Sale.objects.filter(product=product, is_deleted=False)
            .exclude(pk=getattr(self.instance, "pk", None))
            .exists()
        ):
            raise serializers.ValidationError({"product": "Este reloj ya tiene una venta registrada."})
        if not customer and not customer_name:
            raise serializers.ValidationError(
                {"customer_name": "Debes indicar un cliente o al menos un nombre libre."}
            )
        if self.instance:
            layaway = self._get_linked_layaway(self.instance)
            if layaway and product and getattr(product, "id", None) != self.instance.product_id:
                raise serializers.ValidationError(
                    {"product": "La venta de un apartado completado debe seguir ligada al mismo reloj."}
                )
        return attrs

    def _mark_product_as_sold(self, product, sale, user):
        if not product:
            return
        product.status = InventoryItem.STATUS_SOLD
        product.sold_date = sale.sale_date
        product.sold_at = product.sold_at or timezone.now()
        product.days_to_sell = max((sale.sale_date - product.purchase_date).days, 0)
        product.updated_by = user
        product.save()

    def _release_product_if_unused(self, product, user):
        if not product:
            return
        if Sale.objects.filter(product=product, is_deleted=False).exists():
            return
        product.status = InventoryItem.STATUS_AVAILABLE
        product.sold_date = None
        product.sold_at = None
        product.days_to_sell = None
        product.updated_by = user
        product.save()

    def _sync_linked_layaway(
        self,
        sale,
        layaway,
        user,
        *,
        sales_channel,
        extras,
        sale_shipping_cost,
        notes,
    ):
        latest_payment = (
            layaway.payments.filter(is_deleted=False).order_by("-payment_date", "-created_at").first()
        )
        if latest_payment is None:
            raise serializers.ValidationError(
                {"amount_paid": "No se pudo ajustar el apartado porque no tiene abonos registrados."}
            )

        other_payments_total = sum(
            payment.amount
            for payment in layaway.payments.filter(is_deleted=False).exclude(pk=latest_payment.pk)
        )
        next_amount = Decimal(str(sale.amount_paid or "0.00"))
        if next_amount <= other_payments_total:
            raise serializers.ValidationError(
                {
                    "amount_paid": (
                        "El total de la venta debe ser mayor que la suma de los abonos previos del apartado."
                    )
                }
            )

        latest_payment.payment_date = sale.sale_date
        latest_payment.payment_method = sale.payment_method
        latest_payment.account = infer_destination_account(sale.payment_method)
        latest_payment.amount = next_amount - other_payments_total
        latest_payment.updated_by = user
        latest_payment.save()

        layaway.client = sale.client
        layaway.customer_name = sale.customer_name
        layaway.customer_contact = sale.customer_contact
        layaway.agreed_price = next_amount
        layaway.updated_by = user
        layaway.save()

        sync_layaway_payment_finance_entry(latest_payment, user=user)
        deactivate_sale_finance_entries(sale, user)
        reconcile_layaway_completion(layaway, user)

        sale.refresh_from_db()
        sale.sales_channel = sales_channel
        sale.extras = extras
        sale.sale_shipping_cost = sale_shipping_cost
        sale.notes = notes
        sale.updated_by = user
        sale.save(update_fields=[
            "sales_channel",
            "extras",
            "sale_shipping_cost",
            "notes",
            "updated_by",
            "updated_at",
            "total",
            "gross_profit",
            "profit_percentage",
            "extras_account",
            "sale_shipping_account",
            "customer_name",
            "customer_contact",
        ])
        return sale

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

        self._mark_product_as_sold(product, sale, user)

        sync_sale_finance_entry(sale)
        sale.refresh_from_db()
        return sale

    @transaction.atomic
    def update(self, instance, validated_data):
        request = self.context["request"]
        user = request.user
        previous_product = instance.product
        next_product = validated_data.get("product", previous_product)
        linked_layaway = self._get_linked_layaway(instance)
        pending_sales_channel = validated_data.get("sales_channel", instance.sales_channel)
        pending_extras = validated_data.get("extras", instance.extras)
        pending_shipping = validated_data.get("sale_shipping_cost", instance.sale_shipping_cost)
        pending_notes = validated_data.get("notes", instance.notes)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.cost_snapshot = next_product.total_purchase_cost if next_product else Decimal("0.00")
        instance.updated_by = user
        instance.save()

        if linked_layaway:
            return self._sync_linked_layaway(
                instance,
                linked_layaway,
                user,
                sales_channel=pending_sales_channel,
                extras=pending_extras,
                sale_shipping_cost=pending_shipping,
                notes=pending_notes,
            )

        if previous_product_id := getattr(previous_product, "id", None):
            if previous_product_id != getattr(next_product, "id", None):
                self._release_product_if_unused(previous_product, user)

        self._mark_product_as_sold(next_product, instance, user)
        sync_sale_finance_entry(instance)
        instance.refresh_from_db()
        return instance

    def to_representation(self, instance):
        return SaleSerializer(instance, context=self.context).data
