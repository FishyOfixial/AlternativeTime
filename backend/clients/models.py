from api.model_mixins import TimestampedSoftDeleteModel

from django.db import models


class Client(TimestampedSoftDeleteModel):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    instagram_handle = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
