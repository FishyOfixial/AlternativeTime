from rest_framework.viewsets import ModelViewSet

from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(ModelViewSet):
    # DRF handles list/create/retrieve/update/delete for the first MVP version.
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
