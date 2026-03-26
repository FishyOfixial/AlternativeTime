from django.urls import path

from .views import InventorySummaryReportView, SalesSummaryReportView

urlpatterns = [
    path("sales-summary/", SalesSummaryReportView.as_view(), name="sales-summary"),
    path(
        "inventory-summary/",
        InventorySummaryReportView.as_view(),
        name="inventory-summary",
    ),
]
