from django.contrib import admin

from .models import AccountBalance, FinanceEntry


@admin.register(FinanceEntry)
class FinanceEntryAdmin(admin.ModelAdmin):
    list_display = ("id", "entry_type", "concept", "amount", "account", "entry_date")
    list_filter = ("entry_type", "concept", "account")
    search_fields = ("product__product_id", "sale__id")


@admin.register(AccountBalance)
class AccountBalanceAdmin(admin.ModelAdmin):
    list_display = ("account", "balance", "updated_at")
