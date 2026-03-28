from django.contrib import admin
from django.urls import include, path

from layaways.views import NotificationsView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/clients/", include("clients.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/sales/", include("sales.urls")),
    path("api/layaways/", include("layaways.urls")),
    path("api/notifications/", NotificationsView.as_view(), name="notifications"),
    path("api/finance/", include("finance.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/", include("api.urls")),
]
