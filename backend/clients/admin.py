from django.contrib import admin

from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "phone", "instagram_handle", "is_active", "created_at")
    search_fields = ("name", "phone", "email", "instagram_handle")
    list_filter = ("is_active", "is_deleted")
