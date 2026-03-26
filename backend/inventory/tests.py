from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import InventoryItem


class TestInventoryApi(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="inventory-user",
            password="Secret123!",
        )
        self.client.force_authenticate(user=self.user)

    def test_list_inventory_requires_authenticated_request(self):
        unauthenticated_client = APIClient()

        response = unauthenticated_client.get("/api/inventory/")

        self.assertEqual(response.status_code, 401)

    def test_create_inventory_item(self):
        payload = {
            "name": "Blue Pen",
            "sku": "PEN-001",
            "description": "Standard pen",
            "price": "9.99",
            "stock": 12,
        }

        response = self.client.post("/api/inventory/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(InventoryItem.objects.count(), 1)
        self.assertEqual(InventoryItem.objects.first().sku, "PEN-001")

    def test_inventory_rejects_duplicate_sku(self):
        InventoryItem.objects.create(
            name="Blue Pen",
            sku="PEN-001",
            price="9.99",
            stock=5,
        )

        response = self.client.post(
            "/api/inventory/",
            {
                "name": "Another Pen",
                "sku": "PEN-001",
                "price": "10.99",
                "stock": 8,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("sku", response.data)

    def test_inventory_rejects_negative_price(self):
        response = self.client.post(
            "/api/inventory/",
            {
                "name": "Broken Price",
                "sku": "NEG-001",
                "price": "-1.00",
                "stock": 3,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("price", response.data)

    def test_inventory_rejects_negative_stock(self):
        response = self.client.post(
            "/api/inventory/",
            {
                "name": "Broken Stock",
                "sku": "NEG-002",
                "price": "3.00",
                "stock": -1,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("stock", response.data)

    def test_update_inventory_item(self):
        item = InventoryItem.objects.create(
            name="Marker",
            sku="MRK-001",
            price="15.00",
            stock=10,
        )

        response = self.client.patch(
            f"/api/inventory/{item.id}/",
            {"price": "17.50", "stock": 7},
            format="json",
        )

        item.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(str(item.price), "17.50")
        self.assertEqual(item.stock, 7)

    def test_delete_inventory_item(self):
        item = InventoryItem.objects.create(
            name="Delete Item",
            sku="DEL-001",
            price="4.50",
            stock=1,
        )

        response = self.client.delete(f"/api/inventory/{item.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(InventoryItem.objects.filter(id=item.id).exists())
