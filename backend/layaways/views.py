from datetime import timedelta

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory.models import InventoryItem

from .models import Layaway
from .serializers import (
    LayawayCreateSerializer,
    LayawayPaymentCreateSerializer,
    LayawaySerializer,
)


class LayawayViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        queryset = Layaway.objects.select_related("client", "product", "sale")
        params = self.request.query_params

        status_filter = params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        customer_id = params.get("customer")
        if customer_id:
            queryset = queryset.filter(client_id=customer_id)

        date_from = params.get("date_from")
        if date_from:
            queryset = queryset.filter(start_date__gte=date_from)

        date_to = params.get("date_to")
        if date_to:
            queryset = queryset.filter(start_date__lte=date_to)

        return queryset

    def get_serializer_class(self):
        if self.action == "create":
            return LayawayCreateSerializer
        return LayawaySerializer

    @action(detail=True, methods=["post"], url_path="payments")
    def payments(self, request, pk=None):
        layaway = self.get_object()
        serializer = LayawayPaymentCreateSerializer(
            data=request.data,
            context={
                "request": request,
                "layaway": layaway,
            },
        )
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        layaway.refresh_from_db()
        output = LayawaySerializer(layaway, context=self.get_serializer_context())
        return Response(
            {
                "payment_id": payment.id,
                "layaway": output.data,
            },
            status=status.HTTP_201_CREATED,
        )


class NotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        overdue_layaways = Layaway.objects.select_related("product", "client").filter(
            status=Layaway.STATUS_ACTIVE,
            due_date__isnull=False,
            due_date__lt=today,
            balance_due__gt=0,
        )
        old_inventory = InventoryItem.objects.filter(
            status=InventoryItem.STATUS_AVAILABLE,
            purchase_date__lt=today - timedelta(days=60),
        )

        layaway_items = [
            {
                "category": "layaway_overdue",
                "layaway_id": layaway.id,
                "product_id": layaway.product_id,
                "product_code": layaway.product.product_id,
                "product_label": layaway.product.display_name,
                "customer_name": layaway.customer_name,
                "due_date": layaway.due_date,
                "balance_due": layaway.balance_due,
            }
            for layaway in overdue_layaways
        ]

        inventory_items = [
            {
                "category": "inventory_old",
                "product_id": item.id,
                "product_code": item.product_id,
                "product_label": item.display_name,
                "days_in_inventory": item.dias_en_inventario,
                "tag": item.tag,
            }
            for item in old_inventory
        ]

        items = layaway_items + inventory_items
        return Response(
            {
                "items": items,
                "counts": {
                    "layaway_overdue": len(layaway_items),
                    "inventory_old": len(inventory_items),
                },
            }
        )
