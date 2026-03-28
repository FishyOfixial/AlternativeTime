from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from inventory.models import InventoryItem, PurchaseCost
from sales.models import Sale

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

    def test_create_client_rejects_duplicate_phone(self):
        Client.objects.create(name="Existing", phone="555-111-2222")

        response = self.client.post(
            "/api/clients/",
            {
                "name": "Acme Corp",
                "phone": "555-111-2222",
                "instagram_handle": "@acme",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("phone", response.data)

    def test_retrieve_client_includes_purchase_history(self):
        client = Client.objects.create(
            name="Repeat Buyer",
            phone="555-4444",
            instagram_handle="@repeatbuyer",
        )
        item = InventoryItem.objects.create(
            brand="Classic",
            model_name="Watch",
            name="Classic Watch",
            product_id="CLA-001",
            sku="CLA-001",
            price=Decimal("1550.00"),
            purchase_date=timezone.localdate(),
            status="sold",
            sold_date=timezone.localdate(),
            days_to_sell=0,
            stock=0,
            is_active=False,
        )
        PurchaseCost.objects.create(
            product=item,
            purchase_date=item.purchase_date,
            watch_cost=Decimal("1000.00"),
            shipping_cost=Decimal("0.00"),
            maintenance_cost=Decimal("0.00"),
            other_costs=Decimal("0.00"),
        )
        Sale.objects.create(
            client=client,
            product=item,
            sale_date=timezone.localdate(),
            payment_method="cash",
            sales_channel="direct",
            amount_paid=Decimal("1550.00"),
            cost_snapshot=Decimal("1000.00"),
            gross_profit=Decimal("550.00"),
            created_by=self.user,
            updated_by=self.user,
        )

        response = self.client.get(f"/api/clients/{client.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["instagram_handle"], "@repeatbuyer")
        self.assertEqual(response.data["purchases_count"], 1)
        self.assertEqual(response.data["total_spent"], "1550")
        self.assertEqual(len(response.data["purchase_history"]), 1)
        self.assertEqual(response.data["purchase_history"][0]["item_names"], ["Classic Watch"])
