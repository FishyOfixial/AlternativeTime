from rest_framework import serializers

from .models import FinanceEntry


class FinanceEntrySerializer(serializers.ModelSerializer):
    product_code = serializers.CharField(source="product.product_id", read_only=True)
    product_label = serializers.CharField(source="product.display_name", read_only=True)
    sale_id = serializers.IntegerField(source="sale.id", read_only=True)
    created_by_id = serializers.IntegerField(source="created_by.id", read_only=True)
    updated_by_id = serializers.IntegerField(source="updated_by.id", read_only=True)

    class Meta:
        model = FinanceEntry
        fields = [
            "id",
            "entry_date",
            "entry_type",
            "concept",
            "amount",
            "account",
            "notes",
            "product",
            "product_code",
            "product_label",
            "sale",
            "sale_id",
            "is_automatic",
            "created_by_id",
            "updated_by_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "product_code",
            "product_label",
            "sale_id",
            "is_automatic",
            "created_by_id",
            "updated_by_id",
            "created_at",
            "updated_at",
        ]


class FinanceEntryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceEntry
        fields = [
            "entry_date",
            "entry_type",
            "concept",
            "amount",
            "account",
            "notes",
            "product",
            "sale",
        ]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if attrs.get("amount") is not None and attrs["amount"] <= 0:
            raise serializers.ValidationError({"amount": "El monto debe ser mayor a cero."})
        return attrs
