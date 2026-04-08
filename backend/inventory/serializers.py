from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from finance.services import delete_purchase_cost_line_relationship, sync_purchase_cost_line_finance_entry

from .models import InventoryItem, PurchaseCost, PurchaseCostLine


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


class PurchaseCostLineSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    finance_entry = serializers.IntegerField(source="finance_entry_id", read_only=True)

    class Meta:
        model = PurchaseCostLine
        fields = [
            "id",
            "cost_type",
            "amount",
            "account",
            "payment_method",
            "cost_date",
            "notes",
            "finance_entry",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "finance_entry", "created_at", "updated_at"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if attrs.get("amount") is not None and attrs["amount"] < 0:
            raise serializers.ValidationError({"amount": "El monto no puede ser negativo."})
        cost_type = attrs.get("cost_type", getattr(self.instance, "cost_type", None))
        product = attrs.get("product", getattr(self.instance, "product", None))
        if cost_type == PurchaseCostLine.TYPE_WATCH and product is not None:
            queryset = PurchaseCostLine.objects.filter(
                product=product,
                cost_type=PurchaseCostLine.TYPE_WATCH,
                is_deleted=False,
            )
            if self.instance is not None:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError(
                    {"cost_type": "Este reloj ya tiene costo de reloj. Edita el existente."}
                )
        return attrs


class InventoryItemSerializer(serializers.ModelSerializer):
    purchase_cost = PurchaseCostSerializer(required=False)
    purchase_costs = PurchaseCostLineSerializer(many=True, required=False, source="purchase_cost_lines")
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
            "purchase_costs",
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

    def _legacy_purchase_cost_to_lines(self, purchase_cost_data, product):
        mapping = [
            ("watch_cost", PurchaseCostLine.TYPE_WATCH),
            ("shipping_cost", PurchaseCostLine.TYPE_SHIPPING),
            ("maintenance_cost", PurchaseCostLine.TYPE_MAINTENANCE),
            ("other_costs", PurchaseCostLine.TYPE_OTHER),
        ]
        return [
            {
                "cost_type": cost_type,
                "amount": purchase_cost_data.get(field, Decimal("0.00")),
                "account": purchase_cost_data.get("source_account", "cash"),
                "payment_method": purchase_cost_data.get("payment_method", "cash"),
                "cost_date": product.purchase_date,
                "notes": purchase_cost_data.get("notes", ""),
            }
            for field, cost_type in mapping
            if Decimal(str(purchase_cost_data.get(field, Decimal("0.00")) or "0.00")) > 0
        ]

    def _sync_legacy_purchase_cost_record(self, product, purchase_cost_data):
        purchase_cost, _ = PurchaseCost.objects.get_or_create(
            product=product,
            defaults={"purchase_date": product.purchase_date},
        )
        for field, value in purchase_cost_data.items():
            setattr(purchase_cost, field, value)
        purchase_cost.purchase_date = product.purchase_date
        purchase_cost.save()
        return purchase_cost

    def _sync_purchase_cost_lines(self, product, cost_lines_data, user):
        watch_ids = set()
        watch_new_count = 0
        existing_watch = product.purchase_cost_lines.filter(
            cost_type=PurchaseCostLine.TYPE_WATCH,
            is_deleted=False,
        ).first()
        for index, line_data in enumerate(cost_lines_data):
            if line_data.get("cost_type") != PurchaseCostLine.TYPE_WATCH:
                continue
            if line_data.get("id"):
                watch_ids.add(line_data["id"])
            else:
                watch_new_count += 1
            if len(watch_ids) + watch_new_count > 1 or (existing_watch and watch_new_count):
                raise serializers.ValidationError(
                    {f"purchase_costs.{index}.cost_type": "Este reloj ya tiene costo de reloj. Edita el existente."}
                )

        existing_by_id = {
            cost_line.id: cost_line
            for cost_line in product.purchase_cost_lines.all()
        }
        seen_ids = set()

        for line_data in cost_lines_data:
            line_id = line_data.get("id")
            if line_id:
                cost_line = existing_by_id.get(line_id)
                if cost_line is None:
                    raise serializers.ValidationError(
                        {"purchase_costs": f"No encontramos el costo #{line_id} en este reloj."}
                    )
                seen_ids.add(line_id)
                old_account = cost_line.account
                for field, value in line_data.items():
                    if field != "id":
                        setattr(cost_line, field, value)
                cost_line.updated_by = user if getattr(user, "is_authenticated", False) else cost_line.updated_by
                cost_line.is_deleted = False
                cost_line.save()
                sync_purchase_cost_line_finance_entry(cost_line)
                if old_account != cost_line.account:
                    from finance.services import recalculate_account_balance

                    recalculate_account_balance(old_account)
                continue

            cost_line = PurchaseCostLine.objects.create(
                product=product,
                cost_date=line_data.get("cost_date") or product.purchase_date,
                cost_type=line_data.get("cost_type", PurchaseCostLine.TYPE_OTHER),
                amount=line_data.get("amount", Decimal("0.00")),
                account=line_data.get("account", "cash"),
                payment_method=line_data.get("payment_method", "cash"),
                notes=line_data.get("notes", ""),
                created_by=user if getattr(user, "is_authenticated", False) else None,
                updated_by=user if getattr(user, "is_authenticated", False) else None,
            )
            seen_ids.add(cost_line.id)
            sync_purchase_cost_line_finance_entry(cost_line)

        for cost_line in product.purchase_cost_lines.filter(is_deleted=False).exclude(id__in=seen_ids):
            delete_purchase_cost_line_relationship(cost_line, user)

    @transaction.atomic
    def create(self, validated_data):
        purchase_cost_data = validated_data.pop("purchase_cost", None)
        purchase_costs_data = validated_data.pop("purchase_cost_lines", None)
        legacy_purchase_cost_data = purchase_cost_data or {
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
        if purchase_costs_data is None:
            self._sync_legacy_purchase_cost_record(product, legacy_purchase_cost_data)
            purchase_costs_data = self._legacy_purchase_cost_to_lines(legacy_purchase_cost_data, product)
        self._sync_purchase_cost_lines(product, purchase_costs_data, user)
        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        purchase_cost_data = validated_data.pop("purchase_cost", None)
        purchase_costs_data = validated_data.pop("purchase_cost_lines", None)
        request = self.context.get("request")
        user = getattr(request, "user", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if getattr(user, "is_authenticated", False):
            instance.updated_by = user
        instance.save()
        if purchase_costs_data is None and purchase_cost_data is None and any(
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
        if purchase_costs_data is None and purchase_cost_data is not None:
            self._sync_legacy_purchase_cost_record(instance, purchase_cost_data)
            purchase_costs_data = self._legacy_purchase_cost_to_lines(purchase_cost_data, instance)
        if purchase_costs_data is not None:
            self._sync_purchase_cost_lines(instance, purchase_costs_data, user)
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["tag"] = data["age_tag"]
        return data
