from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from clients.models import Client
from finance.models import FinanceEntry
from finance.services import recalculate_account_balance
from inventory.models import InventoryItem
from sales.models import Sale

from .models import Layaway, LayawayPayment


class LayawayPaymentSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = LayawayPayment
        fields = [
            "id",
            "payment_date",
            "amount",
            "payment_method",
            "account",
            "notes",
            "created_by_username",
            "created_at",
        ]
        read_only_fields = ["id", "created_by_username", "created_at"]


class LayawaySerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    product_label = serializers.CharField(source="product.display_name", read_only=True)
    product_code = serializers.CharField(source="product.product_id", read_only=True)
    payments = LayawayPaymentSerializer(many=True, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    product_status = serializers.CharField(source="product.status", read_only=True)

    class Meta:
        model = Layaway
        fields = [
            "id",
            "product",
            "product_label",
            "product_code",
            "client",
            "client_name",
            "customer_name",
            "customer_contact",
            "agreed_price",
            "amount_paid",
            "balance_due",
            "start_date",
            "due_date",
            "status",
            "product_status",
            "sale",
            "notes",
            "is_overdue",
            "payments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "product_label",
            "product_code",
            "client_name",
            "amount_paid",
            "balance_due",
            "sale",
            "is_overdue",
            "payments",
            "created_at",
            "updated_at",
        ]


class LayawayCreateSerializer(serializers.ModelSerializer):
    client = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        required=False,
        allow_null=True,
    )
    product = serializers.PrimaryKeyRelatedField(queryset=InventoryItem.objects.all())

    class Meta:
        model = Layaway
        fields = [
            "product",
            "client",
            "customer_name",
            "customer_contact",
            "agreed_price",
            "start_date",
            "due_date",
            "notes",
        ]

    def validate(self, attrs):
        product = attrs["product"]
        client = attrs.get("client")
        customer_name = (attrs.get("customer_name") or "").strip()
        due_date = attrs.get("due_date")
        start_date = attrs.get("start_date") or timezone.localdate()
        agreed_price = Decimal(attrs.get("agreed_price") or Decimal("0.00"))

        if agreed_price <= 0:
            raise serializers.ValidationError({"agreed_price": "El precio acordado debe ser mayor a 0."})
        if product.status != InventoryItem.STATUS_AVAILABLE:
            raise serializers.ValidationError({"product": "Solo puedes apartar relojes disponibles."})
        if Layaway.objects.filter(
            product=product,
            status=Layaway.STATUS_ACTIVE,
        ).exists():
            raise serializers.ValidationError({"product": "Este reloj ya tiene un apartado activo."})
        if due_date and due_date < start_date:
            raise serializers.ValidationError({"due_date": "La fecha limite no puede ser menor al inicio."})
        if not client and not customer_name:
            raise serializers.ValidationError(
                {"customer_name": "Debes elegir cliente o indicar al menos un nombre."}
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        product = validated_data["product"]

        layaway = Layaway.objects.create(
            **validated_data,
            amount_paid=Decimal("0.00"),
            created_by=user,
            updated_by=user,
        )
        product.status = InventoryItem.STATUS_RESERVED
        product.updated_by = user
        product.save(update_fields=["status", "updated_by", "updated_at"])
        layaway.refresh_from_db()
        return layaway

    def to_representation(self, instance):
        return LayawaySerializer(instance, context=self.context).data


class LayawayPaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LayawayPayment
        fields = ["payment_date", "amount", "payment_method", "account", "notes"]

    def validate(self, attrs):
        layaway = self.context["layaway"]
        payment_date = attrs.get("payment_date") or timezone.localdate()
        amount = Decimal(attrs.get("amount") or Decimal("0.00"))

        if layaway.status != Layaway.STATUS_ACTIVE:
            raise serializers.ValidationError({"layaway": "Solo puedes abonar apartados activos."})
        if payment_date > timezone.localdate():
            raise serializers.ValidationError({"payment_date": "No se permiten abonos futuros."})
        if payment_date < layaway.start_date:
            raise serializers.ValidationError(
                {"payment_date": "El abono no puede ser anterior al inicio del apartado."}
            )
        if amount <= 0:
            raise serializers.ValidationError({"amount": "El abono debe ser mayor a 0."})
        if amount > layaway.balance_due:
            raise serializers.ValidationError({"amount": "El abono no puede superar el saldo pendiente."})
        return attrs

    def _create_finance_entry(self, layaway, payment, user):
        entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_LAYAWAY_PAYMENT,
            amount=payment.amount,
            account=payment.account,
            entry_date=payment.payment_date,
            is_automatic=True,
            notes=payment.notes,
            product=layaway.product,
            created_by=user,
            updated_by=user,
        )
        recalculate_account_balance(entry.account)

    def _complete_layaway(self, layaway, user, payment_method, payment_date):
        sale = Sale.objects.create(
            client=layaway.client,
            product=layaway.product,
            sale_date=payment_date,
            customer_name=layaway.customer_name,
            customer_contact=layaway.customer_contact,
            payment_method=payment_method,
            sales_channel=InventoryItem.CHANNEL_DIRECT,
            amount_paid=layaway.agreed_price,
            extras=Decimal("0.00"),
            sale_shipping_cost=Decimal("0.00"),
            cost_snapshot=layaway.product.total_purchase_cost,
            notes=f"Apartado completado #{layaway.id}",
            created_by=user,
            updated_by=user,
        )
        product = layaway.product
        product.status = InventoryItem.STATUS_SOLD
        product.sold_date = payment_date
        product.sold_at = timezone.now()
        product.days_to_sell = max((payment_date - product.purchase_date).days, 0)
        product.updated_by = user
        product.save(
            update_fields=[
                "status",
                "sold_date",
                "sold_at",
                "days_to_sell",
                "updated_by",
                "updated_at",
                "stock",
                "is_active",
                "tag",
            ]
        )

        layaway.status = Layaway.STATUS_COMPLETED
        layaway.sale = sale
        layaway.updated_by = user
        layaway.save(update_fields=["status", "sale", "updated_by", "updated_at"])

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        layaway = self.context["layaway"]
        payment = LayawayPayment.objects.create(
            layaway=layaway,
            created_by=user,
            updated_by=user,
            **validated_data,
        )
        layaway.updated_by = user
        layaway.save()
        layaway.refresh_from_db()

        self._create_finance_entry(layaway, payment, user)

        if layaway.balance_due <= 0 and layaway.sale_id is None:
            self._complete_layaway(
                layaway=layaway,
                user=user,
                payment_method=payment.payment_method,
                payment_date=payment.payment_date,
            )

        return payment
