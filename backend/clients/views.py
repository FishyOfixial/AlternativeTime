from django.db.models import Count, Max, Prefetch, Sum
from rest_framework.viewsets import ModelViewSet

from sales.models import Sale

from .models import Client
from .serializers import ClientDetailSerializer, ClientSerializer


class ClientViewSet(ModelViewSet):
    # Keep list and detail useful for frontend dashboards without adding a new endpoint.
    queryset = Client.objects.annotate(
        purchases_count=Count("sales", distinct=True),
        total_spent=Sum("sales__total"),
        last_purchase_at=Max("sales__created_at"),
    ).prefetch_related(
        Prefetch("sales", queryset=Sale.objects.prefetch_related("items__inventory_item"))
    )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ClientDetailSerializer
        return ClientSerializer
