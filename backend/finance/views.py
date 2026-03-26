from decimal import Decimal

from django.db.models import Count, Sum
from rest_framework.response import Response
from rest_framework.views import APIView

from sales.models import Sale


class FinanceSummaryView(APIView):
    def get(self, request):
        aggregates = Sale.objects.aggregate(
            total_sales_count=Count("id"),
            gross_revenue=Sum("amount_paid"),
        )

        return Response(
            {
                "total_sales_count": aggregates["total_sales_count"] or 0,
                "gross_revenue": str(aggregates["gross_revenue"] or Decimal("0.00")),
            }
        )
