from django.contrib import admin

from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "phone", "email", "is_active", "created_at")
    search_fields = ("name", "phone", "email")
    list_filter = ("is_active",)
