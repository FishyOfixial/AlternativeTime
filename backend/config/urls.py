from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve
from rest_framework.routers import DefaultRouter

from inventory.views import PublicCatalogViewSet
from layaways.views import NotificationsView

catalog_router = DefaultRouter()
catalog_router.register("", PublicCatalogViewSet, basename="public-catalog")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/clients/", include("clients.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/catalog/", include(catalog_router.urls)),
    path("api/sales/", include("sales.urls")),
    path("api/layaways/", include("layaways.urls")),
    path("api/notifications/", NotificationsView.as_view(), name="notifications"),
    path("api/finance/", include("finance.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/", include("api.urls")),
]

if not settings.CLOUDINARY_URL:
    urlpatterns += [
        re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
    ]
