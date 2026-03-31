from decimal import Decimal

from django.db import transaction
from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from sales.models import Sale

from .models import FinanceEntry
from .serializers import FinanceEntrySerializer, FinanceEntryWriteSerializer
from .services import (
    infer_payment_method_from_account,
    recalculate_account_balance,
    reconcile_layaway_completion,
    sync_layaway_payment_finance_entry,
    sync_purchase_finance_entry,
    sync_sale_finance_entry,
)


class FinanceSummaryView(APIView):
    def get(self, request):
        sales_aggregates = Sale.objects.aggregate(
            total_sales_count=Count("id"),
            gross_revenue=Sum("amount_paid"),
        )
        income_total = FinanceEntry.objects.filter(
            entry_type=FinanceEntry.TYPE_INCOME,
            is_deleted=False,
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        expense_total = FinanceEntry.objects.filter(
            entry_type=FinanceEntry.TYPE_EXPENSE,
            is_deleted=False,
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        return Response(
            {
                "total_sales_count": sales_aggregates["total_sales_count"] or 0,
                "gross_revenue": str(sales_aggregates["gross_revenue"] or Decimal("0.00")),
                "total_income": str(income_total),
                "total_expense": str(expense_total),
                "net_balance": str(income_total - expense_total),
            }
        )


class AccountBalanceView(APIView):
    def get(self, request):
        balances = []
        for account, _label in FinanceEntry.ACCOUNT_CHOICES:
            balance = recalculate_account_balance(account)
            balances.append(
                {
                    "account": balance.account,
                    "balance": str(balance.balance),
                    "updated_at": balance.updated_at,
                }
            )
        return Response(balances)


class FinanceEntryViewSet(viewsets.ModelViewSet):
    queryset = FinanceEntry.objects.select_related("product", "sale", "layaway_payment")

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return FinanceEntryWriteSerializer
        return FinanceEntrySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        date_from = params.get("date_from")
        if date_from:
            queryset = queryset.filter(entry_date__gte=date_from)

        date_to = params.get("date_to")
        if date_to:
            queryset = queryset.filter(entry_date__lte=date_to)

        entry_type = params.get("type")
        if entry_type:
            queryset = queryset.filter(entry_type=entry_type)

        account = params.get("account")
        if account:
            queryset = queryset.filter(account=account)

        concept = params.get("concept")
        if concept:
            queryset = queryset.filter(concept=concept)

        return queryset

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
            is_automatic=False,
        )
        recalculate_account_balance(serializer.instance.account)

    def _update_sale_entry(self, instance, validated_data):
        sale = instance.sale
        if sale is None:
            return False

        sale.amount_paid = validated_data.get("amount", sale.amount_paid)
        sale.sale_date = validated_data.get("entry_date", sale.sale_date)
        sale.notes = validated_data.get("notes", sale.notes)
        sale.payment_method = infer_payment_method_from_account(
            validated_data.get("account", instance.account)
        )
        sale.updated_by = self.request.user
        sale.save()
        sync_sale_finance_entry(sale)
        return True

    def _update_purchase_entry(self, instance, validated_data):
        product = instance.product
        purchase_cost = getattr(product, "purchase_cost", None) if product else None
        if product is None or purchase_cost is None:
            return False

        next_purchase_date = validated_data.get("entry_date", purchase_cost.purchase_date)
        next_amount = Decimal(str(validated_data.get("amount", purchase_cost.total_pagado)))
        fixed_costs = (
            Decimal(str(purchase_cost.shipping_cost or "0.00"))
            + Decimal(str(purchase_cost.maintenance_cost or "0.00"))
            + Decimal(str(purchase_cost.other_costs or "0.00"))
        )

        if next_amount < fixed_costs:
            raise ValidationError(
                {"amount": "El monto no puede ser menor a la suma de envio, mantenimiento y otros costos."}
            )
        if product.sold_date and next_purchase_date > product.sold_date:
            raise ValidationError(
                {"entry_date": "La compra no puede quedar despues de la fecha de venta del reloj."}
            )

        purchase_cost.purchase_date = next_purchase_date
        purchase_cost.source_account = validated_data.get("account", purchase_cost.source_account)
        purchase_cost.notes = validated_data.get("notes", purchase_cost.notes)
        purchase_cost.watch_cost = next_amount - fixed_costs
        purchase_cost.save()

        if product.purchase_date != next_purchase_date:
            product.purchase_date = next_purchase_date
            product.updated_by = self.request.user
            product.save(update_fields=["purchase_date", "updated_by", "updated_at"])

        sync_purchase_finance_entry(product)
        return True

    def _find_layaway_payment(self, instance):
        payment = getattr(instance, "layaway_payment", None)
        if payment is not None:
            return payment

        if instance.concept != FinanceEntry.CONCEPT_LAYAWAY_PAYMENT or instance.product_id is None:
            return None

        from layaways.models import LayawayPayment

        candidates = (
            LayawayPayment.objects.select_related("layaway")
            .filter(
                finance_entry__isnull=True,
                layaway__product_id=instance.product_id,
                payment_date=instance.entry_date,
                amount=instance.amount,
                account=instance.account,
                is_deleted=False,
            )
            .order_by("created_at", "id")
        )

        payment = candidates.first()
        if payment is None and instance.notes:
            payment = (
                LayawayPayment.objects.select_related("layaway")
                .filter(
                    finance_entry__isnull=True,
                    layaway__product_id=instance.product_id,
                    payment_date=instance.entry_date,
                    amount=instance.amount,
                    is_deleted=False,
                    notes=instance.notes,
                )
                .order_by("created_at", "id")
                .first()
            )

        if payment is None:
            return None

        payment.finance_entry = instance
        payment.save(update_fields=["finance_entry"])
        return payment

    def _update_layaway_payment_entry(self, instance, validated_data):
        payment = self._find_layaway_payment(instance)
        if payment is None:
            return False

        layaway = payment.layaway
        next_payment_date = validated_data.get("entry_date", payment.payment_date)
        next_amount = Decimal(str(validated_data.get("amount", payment.amount)))
        other_payments_total = sum(
            existing.amount
            for existing in layaway.payments.filter(is_deleted=False).exclude(pk=payment.pk)
        )
        max_allowed = Decimal(str(layaway.agreed_price or "0.00")) - Decimal(str(other_payments_total or "0.00"))

        if next_payment_date > timezone.localdate():
            raise ValidationError({"entry_date": "No se permiten abonos futuros."})
        if next_payment_date < layaway.start_date:
            raise ValidationError({"entry_date": "El abono no puede ser anterior al inicio del apartado."})
        if next_amount <= 0:
            raise ValidationError({"amount": "El abono debe ser mayor a 0."})
        if next_amount > max_allowed:
            raise ValidationError({"amount": "El abono no puede superar el saldo pendiente restante del apartado."})

        payment.payment_date = next_payment_date
        payment.amount = next_amount
        payment.account = validated_data.get("account", payment.account)
        payment.notes = validated_data.get("notes", payment.notes)
        payment.updated_by = self.request.user
        payment.save()

        layaway.updated_by = self.request.user
        layaway.save()
        sync_layaway_payment_finance_entry(payment, user=self.request.user)
        reconcile_layaway_completion(layaway, self.request.user)
        return True

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        output = FinanceEntrySerializer(
            serializer.instance, context=self.get_serializer_context()
        )
        headers = self.get_success_headers(output.data)
        return Response(output.data, status=status.HTTP_201_CREATED, headers=headers)

    @transaction.atomic
    def perform_update(self, serializer):
        instance = self.get_object()
        old_account = instance.account

        handled = (
            self._update_layaway_payment_entry(instance, serializer.validated_data)
            or self._update_sale_entry(instance, serializer.validated_data)
            or self._update_purchase_entry(instance, serializer.validated_data)
        )

        if not handled:
            serializer.save(updated_by=self.request.user)

        instance.refresh_from_db()
        recalculate_account_balance(old_account)
        recalculate_account_balance(instance.account)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_automatic:
            raise PermissionDenied("No se pueden eliminar movimientos automáticos.")
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted", "updated_at"])
        recalculate_account_balance(instance.account)
        return Response(status=status.HTTP_204_NO_CONTENT)
