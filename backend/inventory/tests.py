from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
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
            "brand": "Seiko",
            "model_name": "Prospex Diver 200M",
            "sku": "SEI-045",
            "year_label": "2019, 70's, Vintage",
            "condition_score": "9.5",
            "provider": "Coleccionista local",
            "description": "Reloj en excelente estado.",
            "price": "9200.00",
            "cost_price": "5500.00",
            "shipping_cost": "250.00",
            "maintenance_cost": "500.00",
            "payment_method": "cash",
            "purchase_date": "2026-03-01",
            "status": "available",
            "tag": "new",
            "sales_channel": "instagram",
            "stock": 1,
        }

        response = self.client.post("/api/inventory/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(InventoryItem.objects.count(), 1)
        item = InventoryItem.objects.first()
        self.assertEqual(item.sku, "SEI-045")
        self.assertEqual(item.brand, "Seiko")
        self.assertEqual(item.model_name, "Prospex Diver 200M")
        self.assertEqual(str(item.cost_price), "5500.00")
        self.assertEqual(item.status, "available")
        self.assertEqual(item.sales_channel, "instagram")

    def test_inventory_derives_brand_and_cost_when_omitted(self):
        response = self.client.post(
            "/api/inventory/",
            {
                "name": "Rolex Submariner",
                "sku": "RLX-001",
                "price": "100.00",
                "stock": 2,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        item = InventoryItem.objects.get()
        self.assertEqual(item.brand, "Rolex")
        self.assertEqual(item.model_name, "Submariner")
        self.assertEqual(str(item.cost_price), "100.00")
        self.assertEqual(item.stock, 1)

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
            name="Omega Speedmaster",
            brand="Omega",
            model_name="Speedmaster",
            sku="OME-001",
            price="15000.00",
            cost_price="7500.00",
            stock=1,
        )

        response = self.client.patch(
            f"/api/inventory/{item.id}/",
            {"price": "17500.00", "cost_price": "8000.00", "status": "reserved"},
            format="json",
        )

        item.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(str(item.price), "17500.00")
        self.assertEqual(str(item.cost_price), "8000.00")
        self.assertEqual(item.status, "reserved")

    def test_inventory_exposes_mockup_metrics(self):
        item = InventoryItem.objects.create(
            name="Bulova Accutron",
            brand="Bulova",
            model_name="Accutron",
            sku="BUL-031",
            year_label="70's",
            condition_score="8.0",
            price="3200.00",
            cost_price="1800.00",
            shipping_cost="100.00",
            maintenance_cost="150.00",
            purchase_date=timezone.localdate() - timezone.timedelta(days=5),
            tag="new",
            sales_channel="whatsapp",
            stock=1,
        )

        response = self.client.get(f"/api/inventory/{item.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["display_name"], "Bulova Accutron")
        self.assertEqual(response.data["days_in_inventory"], 5)
        self.assertEqual(response.data["total_cost"], "2050.00")
        self.assertEqual(response.data["estimated_profit"], "1150.00")

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
