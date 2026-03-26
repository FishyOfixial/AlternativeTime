from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
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
            name="Rolex Datejust",
            brand="Rolex",
            sku="PAPER-001",
            price=Decimal("30.00"),
            cost_price=Decimal("18.00"),
            stock=0,
        )
        self.product_b = InventoryItem.objects.create(
            name="Omega Speedmaster",
            brand="Omega",
            sku="STAP-001",
            price=Decimal("15.00"),
            cost_price=Decimal("9.00"),
            stock=3,
        )
        self.product_c = InventoryItem.objects.create(
            name="Cartier Santos",
            brand="Cartier",
            sku="LAMP-001",
            price=Decimal("80.00"),
            cost_price=Decimal("55.00"),
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

    @patch("django.utils.timezone.now")
    def test_dashboard_summary_report(self, mocked_now):
        mocked_now.return_value = timezone.datetime(
            2026, 3, 20, 12, 0, 0, tzinfo=timezone.get_current_timezone()
        )

        sale_previous = Sale.objects.create(
            client=self.customer,
            created_by=self.user,
            total=Decimal("30.00"),
        )
        sale_previous.created_at = timezone.datetime(
            2026, 2, 10, 11, 0, 0, tzinfo=timezone.get_current_timezone()
        )
        sale_previous.save(update_fields=["created_at"])
        SaleItem.objects.create(
            sale=sale_previous,
            inventory_item=self.product_a,
            quantity=1,
            unit_price=Decimal("30.00"),
            subtotal=Decimal("30.00"),
        )

        sale_current = Sale.objects.create(
            client=self.customer,
            created_by=self.user,
            total=Decimal("125.00"),
        )
        sale_current.created_at = timezone.datetime(
            2026, 3, 15, 10, 0, 0, tzinfo=timezone.get_current_timezone()
        )
        sale_current.save(update_fields=["created_at"])
        SaleItem.objects.create(
            sale=sale_current,
            inventory_item=self.product_c,
            quantity=1,
            unit_price=Decimal("80.00"),
            subtotal=Decimal("80.00"),
        )
        SaleItem.objects.create(
            sale=sale_current,
            inventory_item=self.product_b,
            quantity=3,
            unit_price=Decimal("15.00"),
            subtotal=Decimal("45.00"),
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/reports/dashboard-summary/?range=month&year=2026")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["range"], "month")
        self.assertEqual(response.data["selected_year"], 2026)
        self.assertIn(2026, response.data["available_years"])
        self.assertEqual(response.data["kpis"]["sales_revenue"], "125.00")
        self.assertEqual(response.data["kpis"]["profit_total"], "43.00")
        self.assertEqual(response.data["kpis"]["cost_of_sales"], "82.00")
        self.assertEqual(response.data["kpis"]["capital_in_inventory"], "1127.00")
        self.assertEqual(response.data["kpis"]["units_sold"], 4)
        self.assertAlmostEqual(response.data["kpis"]["sales_revenue_delta"], 316.7)
        self.assertEqual(response.data["brands_sold"][0]["brand"], "Omega")
        self.assertEqual(response.data["brands_sold"][0]["units_sold"], 3)
        self.assertEqual(len(response.data["monthly_breakdown"]), 12)
