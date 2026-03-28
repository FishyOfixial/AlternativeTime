from django.db.models import Count, Max, Prefetch, Q, Sum
from rest_framework.viewsets import ModelViewSet

from sales.models import Sale

from .models import Client
from .serializers import ClientDetailSerializer, ClientSerializer


class ClientViewSet(ModelViewSet):
    def get_queryset(self):
        queryset = Client.objects.annotate(
            purchases_count=Count("sales", distinct=True),
            total_spent=Sum("sales__amount_paid"),
            last_purchase_at=Max("sales__sale_date"),
        ).prefetch_related(
            Prefetch("sales", queryset=Sale.objects.select_related("product"))
        )

        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(phone__icontains=search))
        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ClientDetailSerializer
        return ClientSerializer
