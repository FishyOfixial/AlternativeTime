from calendar import month_abbr
from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory.models import InventoryItem
from sales.models import SaleItem


def infer_brand(item):
    if getattr(item, "brand", ""):
        return item.brand
    return (item.name or "").split(" ")[0] or "Sin marca"


def shift_months(value, months):
    year = value.year + ((value.month - 1 + months) // 12)
    month = ((value.month - 1 + months) % 12) + 1
    return value.replace(year=year, month=month, day=1)


def get_period_bounds(range_key, now):
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    if range_key == "month":
        start = month_start
    elif range_key == "quarter":
        start = shift_months(month_start, -2)
    elif range_key == "half":
        start = shift_months(month_start, -5)
    elif range_key == "year":
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start = None

    return start, now


def compute_summary(items, inventory_items):
    revenue = Decimal("0.00")
    cost_of_sales = Decimal("0.00")
    units_sold = 0
    unique_sales = set()
    weighted_days_sum = Decimal("0.00")
    weighted_days_units = 0
    brands = {}

    for item in items:
        sale = item.sale
        inventory_item = item.inventory_item
        brand = infer_brand(inventory_item)
        quantity = item.quantity
        subtotal = item.subtotal
        unit_cost = inventory_item.cost_price
        sale_cost = unit_cost * quantity
        days_to_sell = max(
            Decimal("0.00"),
            Decimal((sale.created_at - inventory_item.created_at).total_seconds() / 86400),
        )

        revenue += subtotal
        cost_of_sales += sale_cost
        units_sold += quantity
        unique_sales.add(sale.id)
        weighted_days_sum += days_to_sell * quantity
        weighted_days_units += quantity

        brand_entry = brands.setdefault(
            brand,
            {
                "brand": brand,
                "units_sold": 0,
                "revenue": Decimal("0.00"),
                "cost_of_sales": Decimal("0.00"),
                "days_sum": Decimal("0.00"),
                "days_units": 0,
            },
        )
        brand_entry["units_sold"] += quantity
        brand_entry["revenue"] += subtotal
        brand_entry["cost_of_sales"] += sale_cost
        brand_entry["days_sum"] += days_to_sell * quantity
        brand_entry["days_units"] += quantity

    inventory_capital = Decimal("0.00")
    stock_by_brand = {}
    for item in inventory_items:
        brand = infer_brand(item)
        inventory_capital += item.cost_price * item.stock
        stock_by_brand[brand] = stock_by_brand.get(brand, 0) + item.stock

    profit = revenue - cost_of_sales
    avg_days_to_sell = (
        weighted_days_sum / weighted_days_units if weighted_days_units else Decimal("0.00")
    )
    inventory_sales_ratio = inventory_capital / revenue if revenue > 0 else Decimal("0.00")

    brands_sold = []
    for brand_entry in brands.values():
        avg_days = (
            brand_entry["days_sum"] / brand_entry["days_units"]
            if brand_entry["days_units"]
            else Decimal("0.00")
        )
        brands_sold.append(
            {
                "brand": brand_entry["brand"],
                "units_sold": brand_entry["units_sold"],
                "avg_days_to_sell": round(float(avg_days), 1),
                "revenue": str(brand_entry["revenue"]),
                "cost_of_sales": str(brand_entry["cost_of_sales"]),
                "profit": str(brand_entry["revenue"] - brand_entry["cost_of_sales"]),
            }
        )

    brands_sold.sort(key=lambda brand: (-brand["units_sold"], brand["brand"]))
    fastest_selling_brands = sorted(
        brands_sold,
        key=lambda brand: (brand["avg_days_to_sell"], -brand["units_sold"], brand["brand"]),
    )[:5]
    stock_rows = [
        {"brand": brand, "units": units}
        for brand, units in sorted(stock_by_brand.items(), key=lambda item: (-item[1], item[0]))
    ]

    return {
        "sales_revenue": str(revenue),
        "profit_total": str(profit),
        "cost_of_sales": str(cost_of_sales),
        "capital_in_inventory": str(inventory_capital),
        "avg_days_to_sell": round(float(avg_days_to_sell), 1),
        "inventory_sales_ratio": round(float(inventory_sales_ratio), 2),
        "total_sales_count": len(unique_sales),
        "units_sold": units_sold,
        "brands_sold": brands_sold[:5],
        "fastest_selling_brands": fastest_selling_brands,
        "stock_by_brand": stock_rows[:8],
    }


def parse_selected_year(raw_value, fallback_year):
    try:
        return int(raw_value)
    except (TypeError, ValueError):
        return fallback_year


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


class DashboardSummaryReportView(APIView):
    RANGE_VALUES = {"month", "quarter", "half", "year", "lifetime"}

    def get(self, request):
        now = timezone.now()
        range_key = request.query_params.get("range", "month")
        if range_key not in self.RANGE_VALUES:
            range_key = "month"

        selected_year = parse_selected_year(request.query_params.get("year"), now.year)
        current_start, current_end = get_period_bounds(range_key, now)

        sale_items = SaleItem.objects.select_related("sale", "inventory_item")
        inventory_items = InventoryItem.objects.filter(is_active=True)

        if current_start:
            current_items = sale_items.filter(
                sale__created_at__gte=current_start,
                sale__created_at__lte=current_end,
            )
            duration = current_end - current_start
            previous_end = current_start
            previous_start = current_start - duration
            previous_items = sale_items.filter(
                sale__created_at__gte=previous_start,
                sale__created_at__lt=previous_end,
            )
        else:
            current_items = sale_items
            previous_items = sale_items.none()

        current_summary = compute_summary(current_items, inventory_items)
        previous_summary = compute_summary(previous_items, inventory_items)

        def percentage_delta(current_value, previous_value):
            current_decimal = Decimal(str(current_value or 0))
            previous_decimal = Decimal(str(previous_value or 0))
            if previous_decimal == 0:
                return 0.0
            return round(
                float(((current_decimal - previous_decimal) / previous_decimal) * 100),
                1,
            )

        monthly_items = sale_items.filter(sale__created_at__year=selected_year)
        month_map = {
            month_number: {
                "month": month_abbr[month_number],
                "sales": Decimal("0.00"),
                "profit": Decimal("0.00"),
                "cost": Decimal("0.00"),
            }
            for month_number in range(1, 13)
        }

        for item in monthly_items:
            month_bucket = month_map[item.sale.created_at.month]
            month_bucket["sales"] += item.subtotal
            month_bucket["cost"] += item.inventory_item.cost_price * item.quantity
            month_bucket["profit"] = month_bucket["sales"] - month_bucket["cost"]

        monthly_breakdown = [
            {
                "month": bucket["month"],
                "sales": str(bucket["sales"]),
                "profit": str(bucket["profit"]),
                "cost": str(bucket["cost"]),
            }
            for bucket in month_map.values()
        ]

        available_years = sorted(
            {
                now.year,
                *sale_items.values_list("sale__created_at__year", flat=True),
            },
            reverse=True,
        )

        return Response(
            {
                "range": range_key,
                "selected_year": selected_year,
                "available_years": available_years,
                "kpis": {
                    "sales_revenue": current_summary["sales_revenue"],
                    "sales_revenue_delta": percentage_delta(
                        current_summary["sales_revenue"],
                        previous_summary["sales_revenue"],
                    ),
                    "profit_total": current_summary["profit_total"],
                    "profit_total_delta": percentage_delta(
                        current_summary["profit_total"],
                        previous_summary["profit_total"],
                    ),
                    "capital_in_inventory": current_summary["capital_in_inventory"],
                    "avg_days_to_sell": current_summary["avg_days_to_sell"],
                    "cost_of_sales": current_summary["cost_of_sales"],
                    "inventory_sales_ratio": current_summary["inventory_sales_ratio"],
                    "units_sold": current_summary["units_sold"],
                },
                "brands_sold": current_summary["brands_sold"],
                "fastest_selling_brands": current_summary["fastest_selling_brands"],
                "stock_by_brand": current_summary["stock_by_brand"],
                "monthly_breakdown": monthly_breakdown,
            }
        )
