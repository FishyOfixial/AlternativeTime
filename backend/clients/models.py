from django.db import models


class Client(models.Model):
    # Basic customer record used by future sales and reporting flows.
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True)
    instagram_handle = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Show newest clients first in admin and API lists.
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
