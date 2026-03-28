from django.contrib import admin

from .models import Layaway, LayawayPayment


@admin.register(Layaway)
class LayawayAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "client", "agreed_price", "amount_paid", "balance_due", "status")
    list_filter = ("status", "start_date", "due_date")
    search_fields = ("product__product_id", "product__brand", "customer_name")


@admin.register(LayawayPayment)
class LayawayPaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "layaway", "payment_date", "amount", "payment_method", "account")
    list_filter = ("payment_method", "account", "payment_date")
