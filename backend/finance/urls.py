from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AccountBalanceView, FinanceEntryViewSet, FinanceSummaryView

router = DefaultRouter()
router.register("entries", FinanceEntryViewSet, basename="finance-entry")

urlpatterns = [
    path("summary/", FinanceSummaryView.as_view(), name="finance-summary"),
    path("balances/", AccountBalanceView.as_view(), name="finance-balances"),
    path("", include(router.urls)),
]
