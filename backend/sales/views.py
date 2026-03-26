from rest_framework import mixins, status, viewsets
from rest_framework.response import Response

from .models import Sale
from .serializers import SaleCreateSerializer, SaleSerializer


class SaleViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Sale.objects.select_related("client", "created_by").prefetch_related(
        "items__inventory_item"
    )

    def get_serializer_class(self):
        if self.action == "create":
            return SaleCreateSerializer
        return SaleSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sale = serializer.save()

        output = SaleSerializer(sale, context=self.get_serializer_context())
        headers = self.get_success_headers(output.data)
        return Response(output.data, status=status.HTTP_201_CREATED, headers=headers)
