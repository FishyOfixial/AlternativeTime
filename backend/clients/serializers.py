from rest_framework import serializers

from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        # Keep the API contract explicit while exposing timestamps as read-only.
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "address",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
