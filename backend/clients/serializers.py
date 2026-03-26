from decimal import Decimal

from rest_framework import serializers

from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    purchases_count = serializers.IntegerField(read_only=True)
    total_spent = serializers.SerializerMethodField()
    last_purchase_at = serializers.DateTimeField(read_only=True)

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

    def get_total_spent(self, obj):
        total_spent = getattr(obj, "total_spent", None)
        if total_spent is None:
            return str(Decimal("0.00"))
        return str(total_spent)


class ClientPurchaseHistorySerializer(serializers.Serializer):
    sale_id = serializers.IntegerField(source="id")
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    created_at = serializers.DateTimeField()
    item_names = serializers.SerializerMethodField()

    def get_item_names(self, sale):
        return [item.inventory_item.name for item in sale.items.all()]


class ClientDetailSerializer(ClientSerializer):
    purchase_history = serializers.SerializerMethodField()

    class Meta(ClientSerializer.Meta):
        fields = ClientSerializer.Meta.fields + ["purchase_history"]

    def get_purchase_history(self, obj):
        sales = obj.sales.all()[:10]
        return ClientPurchaseHistorySerializer(sales, many=True).data
