from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "status": "ok",
                "message": "Django REST API is running",
                "database": "postgres" if settings.DB_ENGINE == "postgres" else "sqlite",
            }
        )
