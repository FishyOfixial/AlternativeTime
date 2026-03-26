from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from clients.models import Client
from inventory.models import InventoryItem
from sales.models import Sale, SaleItem


class TestReportsApi(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="reports-user",
            password="Secret123!",
        )
        self.customer = Client.objects.create(name="Report Client", phone="555-700-1000")
        self.product_a = InventoryItem.objects.create(
            name="Printer Paper",
            sku="PAPER-001",
            price=Decimal("30.00"),
            stock=0,
        )
        self.product_b = InventoryItem.objects.create(
            name="Stapler",
            sku="STAP-001",
            price=Decimal("15.00"),
            stock=3,
        )
        self.product_c = InventoryItem.objects.create(
            name="Desk Lamp",
            sku="LAMP-001",
            price=Decimal("80.00"),
            stock=20,
        )

    def test_reports_require_authentication(self):
        response = self.client.get("/api/reports/sales-summary/")

        self.assertEqual(response.status_code, 401)

    def test_sales_summary_report(self):
        sale = Sale.objects.create(
            client=self.customer,
            created_by=self.user,
            total=Decimal("125.00"),
        )
        SaleItem.objects.create(
            sale=sale,
            inventory_item=self.product_c,
            quantity=1,
            unit_price=Decimal("80.00"),
            subtotal=Decimal("80.00"),
        )
        SaleItem.objects.create(
            sale=sale,
            inventory_item=self.product_b,
            quantity=3,
            unit_price=Decimal("15.00"),
            subtotal=Decimal("45.00"),
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/reports/sales-summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_sales_count"], 1)
        self.assertEqual(response.data["gross_revenue"], "125")
        self.assertEqual(response.data["items_sold"], 4)

    def test_sales_summary_report_returns_zeroed_metrics_without_sales(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/reports/sales-summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_sales_count"], 0)
        self.assertEqual(response.data["gross_revenue"], "0.00")
        self.assertEqual(response.data["items_sold"], 0)

    def test_inventory_summary_report(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/reports/inventory-summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["active_products"], 3)
        self.assertEqual(response.data["total_stock"], 23)
        self.assertEqual(response.data["low_stock_products"], 2)
        self.assertEqual(response.data["out_of_stock_products"], 1)
