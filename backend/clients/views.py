from django.db.models import Count, Max, Prefetch, Q, Sum
from rest_framework import status
from rest_framework.response import Response
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

        if getattr(self, "action", None) == "list":
            include_inactive = self.request.query_params.get("include_inactive", "").lower()
            if include_inactive not in {"1", "true", "yes"}:
                queryset = queryset.filter(is_active=True)
        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ClientDetailSerializer
        return ClientSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_active:
            instance.is_active = False
            instance.save(update_fields=["is_active", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)
