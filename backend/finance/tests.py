from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from clients.models import Client
from inventory.models import InventoryItem
from sales.models import Sale, SaleItem


class TestFinanceSummaryApi(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="finance-user",
            password="Secret123!",
        )
        self.customer = Client.objects.create(name="Finance Client", phone="555-400-1000")
        self.product = InventoryItem.objects.create(
            name="Calculator",
            sku="CALC-001",
            price=Decimal("100.00"),
            stock=50,
        )

    def test_finance_summary_requires_authentication(self):
        response = self.client.get("/api/finance/summary/")

        self.assertEqual(response.status_code, 401)

    def test_finance_summary_returns_aggregated_sales_metrics(self):
        sale = Sale.objects.create(
            client=self.customer,
            created_by=self.user,
            total=Decimal("200.00"),
        )
        SaleItem.objects.create(
            sale=sale,
            inventory_item=self.product,
            quantity=2,
            unit_price=Decimal("100.00"),
            subtotal=Decimal("200.00"),
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/finance/summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_sales_count"], 1)
        self.assertEqual(response.data["gross_revenue"], "200")
        self.assertEqual(response.data["items_sold"], 2)
