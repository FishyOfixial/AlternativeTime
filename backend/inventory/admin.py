from django.contrib import admin

from .models import InventoryItem


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "sku", "price", "stock", "is_active")
    search_fields = ("name", "sku")
    list_filter = ("is_active",)
