from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from clients.models import Client
from finance.models import FinanceEntry
from inventory.models import InventoryItem, PurchaseCost

from .models import Sale


class TestSalesApi(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="sales-user",
            password="Secret123!",
        )
        self.client.force_authenticate(user=self.user)
        self.customer = Client.objects.create(
            name="Retail Customer",
            phone="555-200-3000",
        )
        self.item = InventoryItem.objects.create(
            brand="Rolex",
            model_name="Datejust",
            name="Rolex Datejust",
            product_id="ROL-001",
            sku="ROL-001",
            price=Decimal("25000.00"),
            purchase_date=timezone.localdate() - timezone.timedelta(days=10),
            status="available",
            created_by=self.user,
            updated_by=self.user,
        )
        PurchaseCost.objects.create(
            product=self.item,
            purchase_date=self.item.purchase_date,
            watch_cost=Decimal("18000.00"),
            shipping_cost=Decimal("500.00"),
            maintenance_cost=Decimal("500.00"),
            other_costs=Decimal("0.00"),
            payment_method="cash",
            source_account="cash",
        )

    def test_sales_requires_authentication(self):
        unauthenticated_client = APIClient()

        response = unauthenticated_client.get("/api/sales/")

        self.assertEqual(response.status_code, 401)

    def test_create_sale_updates_product_and_finance(self):
        response = self.client.post(
            "/api/sales/",
            {
                "customer": self.customer.id,
                "product": self.item.id,
                "sale_date": str(timezone.localdate()),
                "payment_method": "transfer",
                "sales_channel": "instagram",
                "amount_paid": "25000.00",
                "extras": "1000.00",
                "sale_shipping_cost": "300.00",
                "notes": "Cliente recurrente",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        sale = Sale.objects.get()
        self.item.refresh_from_db()
        finance_entry = FinanceEntry.objects.get(sale=sale)
        self.assertEqual(sale.client, self.customer)
        self.assertEqual(sale.product, self.item)
        self.assertEqual(str(sale.cost_snapshot), "19000.00")
        self.assertEqual(str(sale.gross_profit), "4700.00")
        self.assertEqual(self.item.status, InventoryItem.STATUS_SOLD)
        self.assertEqual(self.item.days_to_sell, 10)
        self.assertEqual(finance_entry.entry_type, FinanceEntry.TYPE_INCOME)
        self.assertEqual(str(finance_entry.amount), "25000.00")

    def test_reject_sale_for_sold_product(self):
        self.item.status = InventoryItem.STATUS_SOLD
        self.item.sold_date = timezone.localdate()
        self.item.days_to_sell = 3
        self.item.save()

        response = self.client.post(
            "/api/sales/",
            {
                "customer": self.customer.id,
                "product": self.item.id,
                "sale_date": str(timezone.localdate()),
                "payment_method": "cash",
                "sales_channel": "direct",
                "amount_paid": "25000.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("product", response.data)

    def test_sale_can_be_created_with_free_text_customer(self):
        response = self.client.post(
            "/api/sales/",
            {
                "product": self.item.id,
                "sale_date": str(timezone.localdate()),
                "customer_name": "Cliente mostrador",
                "customer_contact": "@walkin",
                "payment_method": "cash",
                "sales_channel": "direct",
                "amount_paid": "24500.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertIsNone(Sale.objects.get().client)
