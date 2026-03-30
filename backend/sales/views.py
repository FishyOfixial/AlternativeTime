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
    def get_queryset(self):
        queryset = Sale.objects.select_related("client", "product", "created_by")
        params = self.request.query_params

        customer_id = params.get("customer")
        if customer_id:
            queryset = queryset.filter(client_id=customer_id)

        sales_channel = params.get("channel")
        if sales_channel:
            queryset = queryset.filter(sales_channel=sales_channel)

        payment_method = params.get("payment_method")
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)

        brand = params.get("brand")
        if brand:
            queryset = queryset.filter(product__brand__iexact=brand)

        date_from = params.get("date_from")
        if date_from:
            queryset = queryset.filter(sale_date__gte=date_from)

        date_to = params.get("date_to")
        if date_to:
            queryset = queryset.filter(sale_date__lte=date_to)

        return queryset

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
