from calendar import month_abbr
from decimal import Decimal
import csv
from io import BytesIO, StringIO

from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.response import Response
from rest_framework.renderers import BaseRenderer, BrowsableAPIRenderer, JSONRenderer
from rest_framework.views import APIView

from finance.models import FinanceEntry
from inventory.models import InventoryItem, PurchaseCost
from sales.models import Sale


def shift_months(value, months):
    year = value.year + ((value.month - 1 + months) // 12)
    month = ((value.month - 1 + months) % 12) + 1
    return value.replace(year=year, month=month, day=1)


def get_period_bounds(range_key, today):
    month_start = today.replace(day=1)
    if range_key == "month":
        return month_start, today
    if range_key == "quarter":
        return shift_months(month_start, -2), today
    if range_key == "half":
        return shift_months(month_start, -5), today
    if range_key == "year":
        return today.replace(month=1, day=1), today
    return None, today


def compute_summary(sales_queryset, inventory_queryset):
    aggregates = sales_queryset.aggregate(
        revenue=Sum("amount_paid"),
        profit=Sum("gross_profit"),
        cost_of_sales=Sum("cost_snapshot"),
        total_sales_count=Count("id"),
    )
    revenue = aggregates["revenue"] or Decimal("0.00")
    profit = aggregates["profit"] or Decimal("0.00")
    cost_of_sales = aggregates["cost_of_sales"] or Decimal("0.00")

    sold_products = [sale.product for sale in sales_queryset.select_related("product") if sale.product is not None]
    avg_days_to_sell = (
        sum((product.days_to_sell or 0) for product in sold_products) / len(sold_products)
        if sold_products
        else 0
    )

    brands = {}
    for sale in sales_queryset.select_related("product"):
        product = sale.product
        if product is None:
            continue
        entry = brands.setdefault(
            product.brand,
            {
                "brand": product.brand,
                "units_sold": 0,
                "revenue": Decimal("0.00"),
                "cost_of_sales": Decimal("0.00"),
                "profit": Decimal("0.00"),
                "avg_days_to_sell": [],
            },
        )
        entry["units_sold"] += 1
        entry["revenue"] += sale.amount_paid
        entry["cost_of_sales"] += sale.cost_snapshot
        entry["profit"] += sale.gross_profit
        entry["avg_days_to_sell"].append(product.days_to_sell or 0)

    brands_sold = []
    for brand_entry in brands.values():
        avg_days = (
            sum(brand_entry["avg_days_to_sell"]) / len(brand_entry["avg_days_to_sell"])
            if brand_entry["avg_days_to_sell"]
            else 0
        )
        brands_sold.append(
            {
                "brand": brand_entry["brand"],
                "units_sold": brand_entry["units_sold"],
                "avg_days_to_sell": round(avg_days, 1),
                "revenue": str(brand_entry["revenue"]),
                "cost_of_sales": str(brand_entry["cost_of_sales"]),
                "profit": str(brand_entry["profit"]),
            }
        )

    brands_sold.sort(key=lambda row: (-row["units_sold"], row["brand"]))
    fastest_selling_brands = sorted(
        brands_sold,
        key=lambda row: (row["avg_days_to_sell"], -row["units_sold"], row["brand"]),
    )[:5]

    inventory_capital = Decimal("0.00")
    stock_by_brand_map = {}
    for item in inventory_queryset.select_related("purchase_cost"):
        inventory_capital += item.total_purchase_cost
        stock_by_brand_map[item.brand] = stock_by_brand_map.get(item.brand, 0) + 1

    stock_by_brand = [
        {"brand": brand, "units": units}
        for brand, units in sorted(stock_by_brand_map.items(), key=lambda pair: (-pair[1], pair[0]))
    ]

    inventory_sales_ratio = inventory_capital / revenue if revenue > 0 else Decimal("0.00")

    return {
        "sales_revenue": str(revenue),
        "profit_total": str(profit),
        "cost_of_sales": str(cost_of_sales),
        "capital_in_inventory": str(inventory_capital),
        "avg_days_to_sell": round(avg_days_to_sell, 1),
        "inventory_sales_ratio": round(float(inventory_sales_ratio), 2),
        "total_sales_count": aggregates["total_sales_count"] or 0,
        "units_sold": aggregates["total_sales_count"] or 0,
        "brands_sold": brands_sold[:5],
        "fastest_selling_brands": fastest_selling_brands,
        "stock_by_brand": stock_by_brand[:8],
    }


def parse_selected_year(raw_value, fallback_year):
    try:
        return int(raw_value)
    except (TypeError, ValueError):
        return fallback_year


class SalesSummaryReportView(APIView):
    def get(self, request):
        aggregates = Sale.objects.aggregate(
            total_sales_count=Count("id"),
            gross_revenue=Sum("amount_paid"),
        )
        return Response(
            {
                "total_sales_count": aggregates["total_sales_count"] or 0,
                "gross_revenue": str(aggregates["gross_revenue"] or Decimal("0.00")),
                "items_sold": aggregates["total_sales_count"] or 0,
            }
        )


class InventorySummaryReportView(APIView):
    LOW_STOCK_THRESHOLD = 5

    def get(self, request):
        queryset = InventoryItem.objects.all()
        return Response(
            {
                "active_products": queryset.filter(is_active=True).count(),
                "total_stock": queryset.filter(is_active=True).count(),
                "low_stock_products": queryset.filter(is_active=True).count(),
                "out_of_stock_products": queryset.filter(stock=0).count(),
            }
        )


class DashboardSummaryReportView(APIView):
    RANGE_VALUES = {"month", "quarter", "half", "year", "lifetime"}

    def get(self, request):
        today = timezone.localdate()
        range_key = request.query_params.get("range", "month")
        if range_key not in self.RANGE_VALUES:
            range_key = "month"

        selected_year = parse_selected_year(request.query_params.get("year"), today.year)
        current_start, current_end = get_period_bounds(range_key, today)
        sales_queryset = Sale.objects.select_related("product")
        inventory_queryset = InventoryItem.objects.filter(status=InventoryItem.STATUS_AVAILABLE)

        if current_start:
            current_sales = sales_queryset.filter(
                sale_date__gte=current_start,
                sale_date__lte=current_end,
            )
            duration = current_end - current_start
            previous_end = current_start
            previous_start = current_start - duration
            previous_sales = sales_queryset.filter(
                sale_date__gte=previous_start,
                sale_date__lt=previous_end,
            )
        else:
            current_sales = sales_queryset
            previous_sales = Sale.objects.none()

        current_summary = compute_summary(current_sales, inventory_queryset)
        previous_summary = compute_summary(previous_sales, inventory_queryset)

        def percentage_delta(current_value, previous_value):
            current_decimal = Decimal(str(current_value or 0))
            previous_decimal = Decimal(str(previous_value or 0))
            if previous_decimal == 0:
                return 0.0
            return round(float(((current_decimal - previous_decimal) / previous_decimal) * 100), 1)

        month_map = {
            month_number: {
                "month": month_abbr[month_number],
                "sales": Decimal("0.00"),
                "profit": Decimal("0.00"),
                "cost": Decimal("0.00"),
            }
            for month_number in range(1, 13)
        }
        for sale in sales_queryset.filter(sale_date__year=selected_year):
            bucket = month_map[sale.sale_date.month]
            bucket["sales"] += sale.amount_paid
            bucket["profit"] += sale.gross_profit
            bucket["cost"] += sale.cost_snapshot

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
            {today.year, *sales_queryset.values_list("sale_date__year", flat=True)},
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


class ExportReportView(APIView):
    class _PassthroughRenderer(BaseRenderer):
        charset = None

        def render(self, data, accepted_media_type=None, renderer_context=None):
            return data

    class _CsvRenderer(_PassthroughRenderer):
        media_type = "text/csv"
        format = "csv"

    class _XlsxRenderer(_PassthroughRenderer):
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        format = "xlsx"

    renderer_classes = [
        JSONRenderer,
        BrowsableAPIRenderer,
        _CsvRenderer,
        _XlsxRenderer,
    ]

    SUPPORTED_FORMATS = {"csv", "xlsx"}
    REPORT_TYPES = {
        "ventas_por_mes",
        "ganancia_por_periodo",
        "ventas_por_marca",
        "top_productos",
        "slow_movers",
        "inventario_actual",
        "costo_adquisicion",
        "flujo_efectivo",
        "historial_cliente",
    }

    def get(self, request, type):
        report_type = type
        export_format = request.query_params.get("format", "csv")
        if isinstance(export_format, str):
            export_format = export_format.strip().strip('"').strip("'")
        if report_type not in self.REPORT_TYPES:
            return Response({"detail": "Tipo de reporte no soportado."}, status=400)
        if export_format not in self.SUPPORTED_FORMATS:
            return Response({"detail": "Formato no soportado."}, status=400)

        headers, rows = self.build_report(report_type, request.query_params)
        filename = f"{report_type}_{timezone.localdate()}.{export_format}"
        if export_format == "csv":
            return self.build_csv_response(headers, rows, filename)
        return self.build_xlsx_response(headers, rows, filename)

    def build_csv_response(self, headers, rows, filename):
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(headers)
        writer.writerows(rows)
        response = HttpResponse(buffer.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response

    def build_xlsx_response(self, headers, rows, filename):
        from openpyxl import Workbook

        wb = Workbook()
        ws = wb.active
        ws.append(headers)
        for row in rows:
            ws.append(row)
        stream = BytesIO()
        wb.save(stream)
        response = HttpResponse(
            stream.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response

    def parse_date_range(self, params):
        date_from = parse_date(params.get("date_from") or "")
        date_to = parse_date(params.get("date_to") or "")
        return date_from, date_to

    def apply_sales_filters(self, queryset, params):
        date_from, date_to = self.parse_date_range(params)
        if date_from:
            queryset = queryset.filter(sale_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(sale_date__lte=date_to)
        channel = params.get("channel")
        if channel:
            queryset = queryset.filter(sales_channel=channel)
        payment_method = params.get("payment_method")
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        brand = params.get("brand")
        if brand:
            queryset = queryset.filter(product__brand__iexact=brand)
        return queryset

    def build_report(self, report_type, params):
        if report_type == "ventas_por_mes":
            return self.report_sales_by_month(params)
        if report_type == "ganancia_por_periodo":
            return self.report_profit_by_period(params)
        if report_type == "ventas_por_marca":
            return self.report_sales_by_brand(params)
        if report_type == "top_productos":
            return self.report_top_products(params)
        if report_type == "slow_movers":
            return self.report_slow_movers(params)
        if report_type == "inventario_actual":
            return self.report_inventory_current(params)
        if report_type == "costo_adquisicion":
            return self.report_purchase_cost(params)
        if report_type == "flujo_efectivo":
            return self.report_cash_flow(params)
        if report_type == "historial_cliente":
            return self.report_customer_history(params)
        return ([], [])

    def report_sales_by_month(self, params):
        queryset = self.apply_sales_filters(Sale.objects.select_related("product"), params)
        monthly = (
            queryset.annotate(month=TruncMonth("sale_date"))
            .values("month")
            .annotate(
                revenue=Sum("amount_paid"),
                profit=Sum("gross_profit"),
                cost=Sum("cost_snapshot"),
            )
            .order_by("month")
        )
        headers = ["Mes", "Ventas", "Ganancia", "Costo"]
        rows = [
            [
                entry["month"].strftime("%Y-%m"),
                str(entry["revenue"] or Decimal("0.00")),
                str(entry["profit"] or Decimal("0.00")),
                str(entry["cost"] or Decimal("0.00")),
            ]
            for entry in monthly
            if entry["month"]
        ]
        return headers, rows

    def report_profit_by_period(self, params):
        queryset = self.apply_sales_filters(Sale.objects.select_related("product"), params)
        aggregates = queryset.aggregate(
            revenue=Sum("amount_paid"),
            profit=Sum("gross_profit"),
            cost=Sum("cost_snapshot"),
        )
        date_from, date_to = self.parse_date_range(params)
        headers = ["Desde", "Hasta", "Ventas", "Costo", "Ganancia"]
        rows = [
            [
                str(date_from) if date_from else "inicio",
                str(date_to) if date_to else "hoy",
                str(aggregates["revenue"] or Decimal("0.00")),
                str(aggregates["cost"] or Decimal("0.00")),
                str(aggregates["profit"] or Decimal("0.00")),
            ]
        ]
        return headers, rows

    def report_sales_by_brand(self, params):
        queryset = self.apply_sales_filters(Sale.objects.select_related("product"), params)
        grouped = (
            queryset.values("product__brand")
            .annotate(
                units=Count("id"),
                revenue=Sum("amount_paid"),
                cost=Sum("cost_snapshot"),
                profit=Sum("gross_profit"),
            )
            .order_by("-units", "product__brand")
        )
        headers = ["Marca", "Unidades", "Ventas", "Costo", "Ganancia"]
        rows = [
            [
                entry["product__brand"] or "Sin marca",
                entry["units"],
                str(entry["revenue"] or Decimal("0.00")),
                str(entry["cost"] or Decimal("0.00")),
                str(entry["profit"] or Decimal("0.00")),
            ]
            for entry in grouped
        ]
        return headers, rows

    def report_top_products(self, params):
        queryset = self.apply_sales_filters(Sale.objects.select_related("product"), params)
        queryset = queryset.order_by("-gross_profit", "-amount_paid")
        headers = ["Producto", "ID", "Fecha venta", "Monto", "Costo", "Ganancia", "Dias en inventario"]
        rows = [
            [
                sale.product.display_name if sale.product else "Venta",
                sale.product.product_id if sale.product else "",
                str(sale.sale_date),
                str(sale.amount_paid),
                str(sale.cost_snapshot),
                str(sale.gross_profit),
                sale.product.days_to_sell if sale.product else "",
            ]
            for sale in queryset
        ]
        return headers, rows

    def report_slow_movers(self, params):
        dias_minimos = params.get("dias_minimos")
        try:
            dias_minimos = int(dias_minimos) if dias_minimos is not None else 60
        except ValueError:
            dias_minimos = 60
        queryset = InventoryItem.objects.filter(status=InventoryItem.STATUS_AVAILABLE)
        headers = ["ID", "Marca", "Modelo", "Dias en inventario", "Etiqueta"]
        rows = []
        for item in queryset:
            days = item.dias_en_inventario
            if days >= dias_minimos:
                rows.append(
                    [
                        item.product_id,
                        item.brand,
                        item.model_name,
                        days,
                        item.etiqueta_antiguedad,
                    ]
                )
        return headers, rows

    def report_inventory_current(self, params):
        queryset = InventoryItem.objects.select_related("purchase_cost")
        status_value = params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)
        brand = params.get("brand")
        if brand:
            queryset = queryset.filter(brand__iexact=brand)
        tag = params.get("tag")
        if tag:
            queryset = queryset.filter(tag=tag)
        headers = [
            "ID",
            "Marca",
            "Modelo",
            "Precio",
            "Costo total",
            "Estado",
            "Etiqueta",
            "Dias en inventario",
        ]
        rows = [
            [
                item.product_id,
                item.brand,
                item.model_name,
                str(item.price),
                str(item.total_purchase_cost),
                item.status,
                item.tag,
                item.dias_en_inventario,
            ]
            for item in queryset
        ]
        return headers, rows

    def report_purchase_cost(self, params):
        date_from, date_to = self.parse_date_range(params)
        queryset = PurchaseCost.objects.select_related("product")
        if date_from:
            queryset = queryset.filter(purchase_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(purchase_date__lte=date_to)
        payment_method = params.get("payment_method")
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        headers = [
            "Fecha compra",
            "ID",
            "Marca",
            "Modelo",
            "Total pagado",
            "Metodo pago",
            "Cuenta",
            "Notas",
        ]
        rows = [
            [
                str(cost.purchase_date),
                cost.product.product_id if cost.product else "",
                cost.product.brand if cost.product else "",
                cost.product.model_name if cost.product else "",
                str(cost.total_pagado),
                cost.payment_method,
                cost.source_account,
                cost.notes,
            ]
            for cost in queryset
        ]
        return headers, rows

    def report_cash_flow(self, params):
        date_from, date_to = self.parse_date_range(params)
        queryset = FinanceEntry.objects.select_related("product")
        if date_from:
            queryset = queryset.filter(entry_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(entry_date__lte=date_to)
        account = params.get("account")
        if account:
            queryset = queryset.filter(account=account)
        entry_type = params.get("type")
        if entry_type:
            queryset = queryset.filter(entry_type=entry_type)
        headers = ["Fecha", "Tipo", "Concepto", "Monto", "Cuenta", "Reloj", "Notas"]
        rows = [
            [
                str(entry.entry_date),
                entry.entry_type,
                entry.concept,
                str(entry.amount),
                entry.account,
                entry.product.product_id if entry.product else "",
                entry.notes,
            ]
            for entry in queryset
        ]
        return headers, rows

    def report_customer_history(self, params):
        customer_id = params.get("customer_id")
        queryset = Sale.objects.select_related("client", "product")
        if customer_id:
            queryset = queryset.filter(client_id=customer_id)
        headers = ["Cliente", "Fecha", "Reloj", "Monto", "Ganancia", "Canal", "Metodo"]
        rows = [
            [
                sale.client.name if sale.client else "Venta libre",
                str(sale.sale_date),
                sale.product.display_name if sale.product else "",
                str(sale.amount_paid),
                str(sale.gross_profit),
                sale.sales_channel,
                sale.payment_method,
            ]
            for sale in queryset
        ]
        return headers, rows
