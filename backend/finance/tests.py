from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from clients.models import Client
from inventory.models import InventoryItem, PurchaseCost
from sales.models import Sale


class TestFinanceSummaryApi(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="finance-user",
            password="Secret123!",
        )
        self.customer = Client.objects.create(name="Finance Client", phone="555-400-1000")
        self.product = InventoryItem.objects.create(
            brand="Omega",
            model_name="Speedmaster",
            name="Omega Speedmaster",
            product_id="OME-002",
            sku="OME-002",
            price=Decimal("100.00"),
            purchase_date=timezone.localdate(),
        )
        PurchaseCost.objects.create(
            product=self.product,
            purchase_date=self.product.purchase_date,
            watch_cost=Decimal("50.00"),
            shipping_cost=Decimal("0.00"),
            maintenance_cost=Decimal("0.00"),
            other_costs=Decimal("0.00"),
        )

    def test_finance_summary_requires_authentication(self):
        response = self.client.get("/api/finance/summary/")

        self.assertEqual(response.status_code, 401)

    def test_finance_summary_returns_aggregated_sales_metrics(self):
        Sale.objects.create(
            client=self.customer,
            product=self.product,
            sale_date=timezone.localdate(),
            payment_method="cash",
            sales_channel="direct",
            amount_paid=Decimal("200.00"),
            cost_snapshot=Decimal("50.00"),
            gross_profit=Decimal("150.00"),
            created_by=self.user,
            updated_by=self.user,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/finance/summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_sales_count"], 1)
        self.assertEqual(response.data["gross_revenue"], "200")
