from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.management import call_command
from rest_framework.test import APIClient

from clients.models import Client
from finance.models import FinanceEntry
from inventory.models import InventoryItem, PurchaseCostLine
from layaways.models import Layaway, LayawayPayment
from sales.models import Sale


class TestHealthCheck(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check_is_public_and_returns_status_payload(self):
        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "ok")
        self.assertIn(response.data["database"], {"sqlite", "postgres"})


class TestSeedDemoData(TestCase):
    def test_seed_demo_data_is_idempotent(self):
        call_command("seed_demo_data", "--force")
        call_command("seed_demo_data", "--force")

        user = get_user_model().objects.get(username="prueba")

        self.assertTrue(user.check_password("demo"))
        self.assertEqual(Client.objects.count(), 3)
        self.assertEqual(InventoryItem.objects.count(), 4)
        self.assertEqual(Sale.objects.count(), 1)
        self.assertEqual(Layaway.objects.count(), 1)
        self.assertEqual(LayawayPayment.objects.count(), 1)
        self.assertEqual(PurchaseCostLine.objects.count(), 10)
        self.assertEqual(FinanceEntry.objects.count(), 12)
