from django.contrib import admin

from .models import InventoryItem, PurchaseCost


class PurchaseCostInline(admin.StackedInline):
    model = PurchaseCost
    extra = 0


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ("product_id", "display_name", "price", "status", "tag", "purchase_date")
    search_fields = ("product_id", "sku", "brand", "model_name")
    list_filter = ("status", "tag", "brand")
    inlines = [PurchaseCostInline]
