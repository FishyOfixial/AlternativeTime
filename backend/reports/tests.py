from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from clients.models import Client
from inventory.models import InventoryItem, PurchaseCost
from sales.models import Sale


class TestReportsApi(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="reports-user",
            password="Secret123!",
        )
        self.customer = Client.objects.create(name="Report Client", phone="555-700-1000")
        self.product_a = InventoryItem.objects.create(
            brand="Rolex",
            model_name="Datejust",
            name="Rolex Datejust",
            product_id="ROL-010",
            sku="ROL-010",
            price=Decimal("30000.00"),
            purchase_date=timezone.localdate() - timezone.timedelta(days=20),
            status="sold",
            sold_date=timezone.localdate() - timezone.timedelta(days=10),
            days_to_sell=10,
            stock=0,
            is_active=False,
        )
        self.product_b = InventoryItem.objects.create(
            brand="Omega",
            model_name="Speedmaster",
            name="Omega Speedmaster",
            product_id="OME-010",
            sku="OME-010",
            price=Decimal("15000.00"),
            purchase_date=timezone.localdate() - timezone.timedelta(days=5),
            status="available",
        )
        for product, total_cost in [
            (self.product_a, Decimal("20000.00")),
            (self.product_b, Decimal("9000.00")),
        ]:
            PurchaseCost.objects.create(
                product=product,
                purchase_date=product.purchase_date,
                watch_cost=total_cost,
                shipping_cost=Decimal("0.00"),
                maintenance_cost=Decimal("0.00"),
                other_costs=Decimal("0.00"),
            )

    def test_reports_require_authentication(self):
        response = self.client.get("/api/reports/sales-summary/")

        self.assertEqual(response.status_code, 401)

    def test_sales_summary_report(self):
        Sale.objects.create(
            client=self.customer,
            product=self.product_a,
            sale_date=timezone.localdate(),
            payment_method="cash",
            sales_channel="direct",
            amount_paid=Decimal("30000.00"),
            cost_snapshot=Decimal("20000.00"),
            gross_profit=Decimal("10000.00"),
            created_by=self.user,
            updated_by=self.user,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/reports/sales-summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_sales_count"], 1)
        self.assertEqual(response.data["gross_revenue"], "30000")
        self.assertEqual(response.data["items_sold"], 1)

    @patch("django.utils.timezone.localdate")
    def test_dashboard_summary_report(self, mocked_localdate):
        mocked_localdate.return_value = timezone.datetime(2026, 3, 20).date()
        sale_previous = Sale.objects.create(
            client=self.customer,
            product=self.product_a,
            sale_date=timezone.datetime(2026, 2, 10).date(),
            payment_method="cash",
            sales_channel="direct",
            amount_paid=Decimal("30000.00"),
            cost_snapshot=Decimal("20000.00"),
            gross_profit=Decimal("10000.00"),
            created_by=self.user,
            updated_by=self.user,
        )
        sale_previous.created_at = timezone.make_aware(timezone.datetime(2026, 2, 10, 11, 0, 0))
        sale_previous.save(update_fields=["created_at"])

        product_c = InventoryItem.objects.create(
            brand="Omega",
            model_name="Seamaster",
            name="Omega Seamaster",
            product_id="OME-011",
            sku="OME-011",
            price=Decimal("18000.00"),
            purchase_date=timezone.datetime(2026, 3, 1).date(),
            status="sold",
            sold_date=timezone.datetime(2026, 3, 15).date(),
            days_to_sell=14,
            stock=0,
            is_active=False,
        )
        PurchaseCost.objects.create(
            product=product_c,
            purchase_date=product_c.purchase_date,
            watch_cost=Decimal("12000.00"),
            shipping_cost=Decimal("0.00"),
            maintenance_cost=Decimal("0.00"),
            other_costs=Decimal("0.00"),
        )
        Sale.objects.create(
            client=self.customer,
            product=product_c,
            sale_date=timezone.datetime(2026, 3, 15).date(),
            payment_method="transfer",
            sales_channel="instagram",
            amount_paid=Decimal("18000.00"),
            cost_snapshot=Decimal("12000.00"),
            gross_profit=Decimal("6000.00"),
            created_by=self.user,
            updated_by=self.user,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/reports/dashboard-summary/?range=month&year=2026")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["range"], "month")
        self.assertEqual(response.data["selected_year"], 2026)
        self.assertEqual(response.data["kpis"]["sales_revenue"], "18000")
        self.assertEqual(response.data["kpis"]["profit_total"], "6000")
        self.assertEqual(response.data["kpis"]["cost_of_sales"], "12000")
        self.assertEqual(response.data["kpis"]["units_sold"], 1)
        self.assertEqual(len(response.data["monthly_breakdown"]), 12)
