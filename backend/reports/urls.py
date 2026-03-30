from django.urls import path

from .views import (
    DashboardSummaryReportView,
    ExportReportView,
    InventorySummaryReportView,
    SalesSummaryReportView,
)

urlpatterns = [
    path("dashboard-summary/", DashboardSummaryReportView.as_view(), name="dashboard-summary"),
    path("sales-summary/", SalesSummaryReportView.as_view(), name="sales-summary"),
    path("inventory-summary/", InventorySummaryReportView.as_view(),name="inventory-summary"),
    path("<str:type>/export/", ExportReportView.as_view(), name="report-export"),
]
