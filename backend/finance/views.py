from decimal import Decimal

from django.db.models import Count, Sum
from rest_framework.response import Response
from rest_framework.views import APIView

from sales.models import SaleItem


class FinanceSummaryView(APIView):
    # Summary endpoint used as a simple source of truth for dashboard metrics.
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
