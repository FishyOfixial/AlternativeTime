from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from clients.models import Client
from inventory.models import InventoryItem

from .models import Sale, SaleItem


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
        self.item_one = InventoryItem.objects.create(
            name="Notebook",
            sku="NOTE-001",
            price=Decimal("25.00"),
            stock=10,
        )
        self.item_two = InventoryItem.objects.create(
            name="Pencil",
            sku="PEN-002",
            price=Decimal("5.50"),
            stock=20,
        )

    def test_sales_requires_authentication(self):
        unauthenticated_client = APIClient()

        response = unauthenticated_client.get("/api/sales/")

        self.assertEqual(response.status_code, 401)

    def test_create_sale_with_one_item(self):
        response = self.client.post(
            "/api/sales/",
            {
                "client": self.customer.id,
                "items": [
                    {"inventory_item": self.item_one.id},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        sale = Sale.objects.get()
        self.item_one.refresh_from_db()
        self.assertEqual(sale.total, Decimal("25.00"))
        self.assertEqual(self.item_one.stock, 9)
        self.assertEqual(SaleItem.objects.count(), 1)
        self.assertEqual(SaleItem.objects.get().quantity, 1)

    def test_reject_sale_with_multiple_items(self):
        response = self.client.post(
            "/api/sales/",
            {
                "client": self.customer.id,
                "items": [
                    {"inventory_item": self.item_one.id},
                    {"inventory_item": self.item_two.id},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("items", response.data)
        self.assertEqual(Sale.objects.count(), 0)

    def test_reject_sale_with_insufficient_stock(self):
        self.item_one.stock = 0
        self.item_one.save(update_fields=["stock"])

        response = self.client.post(
            "/api/sales/",
            {
                "client": self.customer.id,
                "items": [
                    {"inventory_item": self.item_one.id},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Sale.objects.count(), 0)
        self.item_one.refresh_from_db()
        self.assertEqual(self.item_one.stock, 0)

    def test_sale_failure_is_atomic_when_one_item_is_invalid(self):
        response = self.client.post(
            "/api/sales/",
            {
                "client": self.customer.id,
                "items": [
                    {"inventory_item": self.item_one.id},
                    {"inventory_item": self.item_two.id},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Sale.objects.count(), 0)
        self.item_one.refresh_from_db()
        self.item_two.refresh_from_db()
        self.assertEqual(self.item_one.stock, 10)
        self.assertEqual(self.item_two.stock, 20)

    def test_list_sales(self):
        sale = Sale.objects.create(client=self.customer, created_by=self.user, total=Decimal("10.00"))
        SaleItem.objects.create(
            sale=sale,
            inventory_item=self.item_one,
            quantity=1,
            unit_price=Decimal("10.00"),
            subtotal=Decimal("10.00"),
        )

        response = self.client.get("/api/sales/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_sale(self):
        sale = Sale.objects.create(client=self.customer, created_by=self.user, total=Decimal("10.00"))
        sale_item = SaleItem.objects.create(
            sale=sale,
            inventory_item=self.item_one,
            quantity=1,
            unit_price=Decimal("10.00"),
            subtotal=Decimal("10.00"),
        )

        response = self.client.get(f"/api/sales/{sale.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], sale.id)
        self.assertEqual(response.data["items"][0]["id"], sale_item.id)

    def test_sale_can_be_created_without_client(self):
        response = self.client.post(
            "/api/sales/",
            {
                "items": [
                    {"inventory_item": self.item_one.id},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertIsNone(Sale.objects.get().client)
