from django.contrib import admin

from .models import InventoryItem, InventoryItemImage, PurchaseCost, PurchaseCostLine


class PurchaseCostInline(admin.StackedInline):
    model = PurchaseCost
    extra = 0


class PurchaseCostLineInline(admin.TabularInline):
    model = PurchaseCostLine
    extra = 0


class InventoryItemImageInline(admin.TabularInline):
    model = InventoryItemImage
    extra = 1
    max_num = 10


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ("product_id", "display_name", "price", "status", "is_published", "tag", "purchase_date")
    search_fields = ("product_id", "sku", "brand", "model_name")
    list_filter = ("is_published", "status", "tag", "brand")
    inlines = [InventoryItemImageInline, PurchaseCostLineInline, PurchaseCostInline]
