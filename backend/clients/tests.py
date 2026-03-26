from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Client


class TestClientsApi(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="clients-user",
            password="Secret123!",
        )
        self.client.force_authenticate(user=self.user)

    def test_list_clients_requires_authenticated_request(self):
        unauthenticated_client = APIClient()

        response = unauthenticated_client.get("/api/clients/")

        self.assertEqual(response.status_code, 401)

    def test_create_client(self):
        payload = {
            "name": "Acme Corp",
            "phone": "555-111-2222",
            "email": "contact@acme.test",
            "instagram_handle": "@acme",
            "address": "Industrial Ave 101",
            "notes": "Cliente mayorista",
        }

        response = self.client.post("/api/clients/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Client.objects.count(), 1)
        self.assertEqual(Client.objects.first().name, "Acme Corp")
        self.assertEqual(Client.objects.first().instagram_handle, "@acme")

    def test_list_clients(self):
        Client.objects.create(
            name="Example Client",
            phone="555-999-8888",
            email="example@test.com",
            instagram_handle="@example",
        )

        response = self.client.get("/api/clients/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["instagram_handle"], "@example")
        self.assertEqual(response.data[0]["purchases_count"], 0)
        self.assertEqual(response.data[0]["total_spent"], "0.00")

    def test_update_client(self):
        client = Client.objects.create(
            name="Old Name",
            phone="555-123",
            email="old@test.com",
        )

        response = self.client.patch(
            f"/api/clients/{client.id}/",
            {"name": "New Name", "is_active": False, "instagram_handle": "@new"},
            format="json",
        )

        client.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(client.name, "New Name")
        self.assertFalse(client.is_active)
        self.assertEqual(client.instagram_handle, "@new")

    def test_delete_client(self):
        client = Client.objects.create(
            name="Delete Me",
            phone="555-000",
        )

        response = self.client.delete(f"/api/clients/{client.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Client.objects.filter(id=client.id).exists())

    def test_retrieve_client_includes_purchase_history(self):
        from decimal import Decimal

        from inventory.models import InventoryItem
        from sales.models import Sale, SaleItem

        client = Client.objects.create(
            name="Repeat Buyer",
            phone="555-4444",
            instagram_handle="@repeatbuyer",
        )
        item = InventoryItem.objects.create(
            name="Classic Watch",
            sku="WATCH-001",
            price=Decimal("1550.00"),
            stock=5,
        )
        sale = Sale.objects.create(client=client, created_by=self.user, total=Decimal("1550.00"))
        SaleItem.objects.create(
            sale=sale,
            inventory_item=item,
            quantity=1,
            unit_price=Decimal("1550.00"),
            subtotal=Decimal("1550.00"),
        )

        response = self.client.get(f"/api/clients/{client.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["instagram_handle"], "@repeatbuyer")
        self.assertEqual(response.data["purchases_count"], 1)
        self.assertEqual(response.data["total_spent"], "1550")
        self.assertEqual(len(response.data["purchase_history"]), 1)
        self.assertEqual(response.data["purchase_history"][0]["item_names"], ["Classic Watch"])
