from django.contrib import admin

from .models import Sale, SaleItem


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ("inventory_item", "quantity", "unit_price", "subtotal")


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ("id", "client", "created_by", "total", "created_at")
    list_filter = ("created_at",)
    search_fields = ("client__name", "created_by__username")
    inlines = [SaleItemInline]
