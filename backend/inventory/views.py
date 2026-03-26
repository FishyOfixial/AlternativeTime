from django.db.models import Q
from rest_framework.viewsets import ModelViewSet

from .models import InventoryItem
from .serializers import InventoryItemSerializer


class InventoryItemViewSet(ModelViewSet):
    serializer_class = InventoryItemSerializer

    def get_queryset(self):
        queryset = InventoryItem.objects.select_related("purchase_cost")
        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(product_id__icontains=search)
                | Q(sku__icontains=search)
                | Q(brand__icontains=search)
                | Q(model_name__icontains=search)
            )

        brand = params.get("brand")
        if brand:
            queryset = queryset.filter(brand__iexact=brand)

        status_value = params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)

        tag = params.get("tag")
        if tag:
            queryset = queryset.filter(tag=tag)

        return queryset
