from decimal import Decimal

from django.db.models import Count, Q, Sum
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory.models import InventoryItem
from sales.models import SaleItem


class SalesSummaryReportView(APIView):
    def get(self, request):
        aggregates = SaleItem.objects.aggregate(
            total_sales_count=Count("sale", distinct=True),
            gross_revenue=Sum("subtotal"),
            items_sold=Sum("quantity"),
        )

        return Response(
            {
                "total_sales_count": aggregates["total_sales_count"] or 0,
                "gross_revenue": str(aggregates["gross_revenue"] or Decimal("0.00")),
                "items_sold": aggregates["items_sold"] or 0,
            }
        )


class InventorySummaryReportView(APIView):
    LOW_STOCK_THRESHOLD = 5

    def get(self, request):
        aggregates = InventoryItem.objects.aggregate(
            active_products=Count("id", filter=Q(is_active=True)),
            total_stock=Sum("stock"),
            low_stock_products=Count(
                "id",
                filter=Q(is_active=True, stock__lte=self.LOW_STOCK_THRESHOLD),
            ),
            out_of_stock_products=Count("id", filter=Q(is_active=True, stock=0)),
        )

        return Response(
            {
                "active_products": aggregates["active_products"] or 0,
                "total_stock": aggregates["total_stock"] or 0,
                "low_stock_products": aggregates["low_stock_products"] or 0,
                "out_of_stock_products": aggregates["out_of_stock_products"] or 0,
            }
        )
