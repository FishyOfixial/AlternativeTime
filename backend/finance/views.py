from decimal import Decimal

from django.db.models import Count, Sum
from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from sales.models import Sale

from .models import AccountBalance, FinanceEntry
from .serializers import FinanceEntrySerializer, FinanceEntryWriteSerializer
from .services import recalculate_account_balance


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
    queryset = FinanceEntry.objects.select_related("product", "sale")

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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        output = FinanceEntrySerializer(
            serializer.instance, context=self.get_serializer_context()
        )
        headers = self.get_success_headers(output.data)
        return Response(output.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.is_automatic:
            raise PermissionDenied("No se pueden editar movimientos automáticos.")
        old_account = instance.account
        serializer.save(updated_by=self.request.user)
        recalculate_account_balance(old_account)
        recalculate_account_balance(serializer.instance.account)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_automatic:
            raise PermissionDenied("No se pueden eliminar movimientos automáticos.")
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted", "updated_at"])
        recalculate_account_balance(instance.account)
        return Response(status=status.HTTP_204_NO_CONTENT)
