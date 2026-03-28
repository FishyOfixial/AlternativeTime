from django.contrib import admin

from .models import Sale


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "customer", "amount_paid", "sale_date", "payment_method")
    list_filter = ("sale_date", "payment_method", "sales_channel")
    search_fields = ("product__product_id", "product__brand", "customer__name", "customer_name")
