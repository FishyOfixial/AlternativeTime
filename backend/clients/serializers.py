from decimal import Decimal

from rest_framework import serializers

from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    purchases_count = serializers.IntegerField(read_only=True)
    total_spent = serializers.SerializerMethodField()
    last_purchase_at = serializers.DateField(read_only=True)

    class Meta:
        model = Client
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "instagram_handle",
            "address",
            "notes",
            "is_active",
            "purchases_count",
            "total_spent",
            "last_purchase_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "purchases_count",
            "total_spent",
            "last_purchase_at",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        instance = getattr(self, "instance", None)
        phone = attrs.get("phone", getattr(instance, "phone", "")).strip()
        instagram_handle = attrs.get(
            "instagram_handle", getattr(instance, "instagram_handle", "")
        ).strip()

        duplicate_queryset = Client.objects.all()
        if instance is not None:
            duplicate_queryset = duplicate_queryset.exclude(pk=instance.pk)

        errors = {}
        if phone and duplicate_queryset.filter(phone__iexact=phone).exists():
            errors["phone"] = "Ya existe un cliente con este telefono."
        if instagram_handle and duplicate_queryset.filter(
            instagram_handle__iexact=instagram_handle
        ).exists():
            errors["instagram_handle"] = "Ya existe un cliente con este perfil de Instagram."
        if errors:
            raise serializers.ValidationError(errors)
        return attrs

    def get_total_spent(self, obj):
        total_spent = getattr(obj, "total_spent", None)
        return str(total_spent if total_spent is not None else Decimal("0.00"))


class ClientPurchaseHistorySerializer(serializers.Serializer):
    sale_id = serializers.IntegerField(source="id")
    total = serializers.DecimalField(source="amount_paid", max_digits=10, decimal_places=2)
    created_at = serializers.DateTimeField()
    item_names = serializers.SerializerMethodField()

    def get_item_names(self, sale):
        return [sale.product.display_name] if sale.product_id else []


class ClientDetailSerializer(ClientSerializer):
    purchase_history = serializers.SerializerMethodField()

    class Meta(ClientSerializer.Meta):
        fields = ClientSerializer.Meta.fields + ["purchase_history"]

    def get_purchase_history(self, obj):
        sales = obj.sales.select_related("product").all()[:10]
        return ClientPurchaseHistorySerializer(sales, many=True).data
