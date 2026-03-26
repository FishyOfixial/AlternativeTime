from rest_framework.viewsets import ModelViewSet

from .models import InventoryItem
from .serializers import InventoryItemSerializer


class InventoryItemViewSet(ModelViewSet):
    # CRUD is enough here until sales introduce inventory-specific workflows.
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
