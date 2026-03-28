from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from clients.models import Client
from finance.models import FinanceEntry
from inventory.models import InventoryItem, PurchaseCost
from sales.models import Sale

from .models import Layaway


class LayawayApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="layaway-user",
            password="Secret123!",
        )
        self.client.force_authenticate(user=self.user)
        self.customer = Client.objects.create(
            name="Cliente Apartado",
            phone="555-900-1000",
        )
        self.item = InventoryItem.objects.create(
            brand="Seiko",
            model_name="5 Sports",
            name="Seiko 5 Sports",
            product_id="SEI-999",
            sku="SEI-999",
            price=Decimal("10000.00"),
            purchase_date=timezone.localdate() - timezone.timedelta(days=15),
            status="available",
            created_by=self.user,
            updated_by=self.user,
        )
        PurchaseCost.objects.create(
            product=self.item,
            purchase_date=self.item.purchase_date,
            watch_cost=Decimal("7000.00"),
            shipping_cost=Decimal("200.00"),
            maintenance_cost=Decimal("300.00"),
            other_costs=Decimal("0.00"),
        )

    def test_create_layaway_with_existing_customer(self):
        response = self.client.post(
            "/api/layaways/",
            {
                "product": self.item.id,
                "client": self.customer.id,
                "agreed_price": "9500.00",
                "start_date": str(timezone.localdate()),
                "due_date": str(timezone.localdate() + timezone.timedelta(days=10)),
                "notes": "Apartado de prueba",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        layaway = Layaway.objects.get()
        self.item.refresh_from_db()
        self.assertEqual(layaway.client, self.customer)
        self.assertEqual(str(layaway.balance_due), "9500.00")
        self.assertEqual(self.item.status, InventoryItem.STATUS_RESERVED)

    def test_create_layaway_with_free_text_customer(self):
        response = self.client.post(
            "/api/layaways/",
            {
                "product": self.item.id,
                "customer_name": "Cliente Mostrador",
                "customer_contact": "@walkin",
                "agreed_price": "9000.00",
                "start_date": str(timezone.localdate()),
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        layaway = Layaway.objects.get()
        self.assertIsNone(layaway.client)
        self.assertEqual(layaway.customer_name, "Cliente Mostrador")

    def test_reject_layaway_for_non_available_product(self):
        self.item.status = InventoryItem.STATUS_SOLD
        self.item.sold_date = timezone.localdate()
        self.item.save()

        response = self.client.post(
            "/api/layaways/",
            {
                "product": self.item.id,
                "customer_name": "Cliente",
                "agreed_price": "9000.00",
                "start_date": str(timezone.localdate()),
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("product", response.data)

    def test_register_partial_and_final_payment(self):
        layaway = Layaway.objects.create(
            product=self.item,
            client=self.customer,
            agreed_price=Decimal("9000.00"),
            start_date=timezone.localdate(),
            created_by=self.user,
            updated_by=self.user,
        )
        self.item.status = InventoryItem.STATUS_RESERVED
        self.item.save()

        partial_response = self.client.post(
            f"/api/layaways/{layaway.id}/payments/",
            {
                "payment_date": str(timezone.localdate()),
                "amount": "3000.00",
                "payment_method": "cash",
                "account": "cash",
                "notes": "Primer abono",
            },
            format="json",
        )
        self.assertEqual(partial_response.status_code, 201)
        layaway.refresh_from_db()
        self.assertEqual(str(layaway.amount_paid), "3000.00")
        self.assertEqual(str(layaway.balance_due), "6000.00")
        self.assertEqual(layaway.status, Layaway.STATUS_ACTIVE)

        final_response = self.client.post(
            f"/api/layaways/{layaway.id}/payments/",
            {
                "payment_date": str(timezone.localdate()),
                "amount": "6000.00",
                "payment_method": "transfer",
                "account": "bbva",
                "notes": "Liquidacion",
            },
            format="json",
        )
        self.assertEqual(final_response.status_code, 201)
        layaway.refresh_from_db()
        self.item.refresh_from_db()
        self.assertEqual(layaway.status, Layaway.STATUS_COMPLETED)
        self.assertEqual(str(layaway.balance_due), "0.00")
        self.assertIsNotNone(layaway.sale_id)
        self.assertEqual(self.item.status, InventoryItem.STATUS_SOLD)
        sale = Sale.objects.get(id=layaway.sale_id)
        self.assertEqual(str(sale.amount_paid), "9000.00")
        payment_entries = FinanceEntry.objects.filter(concept=FinanceEntry.CONCEPT_LAYAWAY_PAYMENT)
        self.assertEqual(payment_entries.count(), 2)
        self.assertFalse(FinanceEntry.objects.filter(sale=sale).exists())

    def test_notifications_endpoint_returns_categories(self):
        old_item = InventoryItem.objects.create(
            brand="Omega",
            model_name="Geneve",
            name="Omega Geneve",
            product_id="OME-333",
            sku="OME-333",
            price=Decimal("8000.00"),
            purchase_date=timezone.localdate() - timezone.timedelta(days=80),
            status=InventoryItem.STATUS_AVAILABLE,
            created_by=self.user,
            updated_by=self.user,
        )
        PurchaseCost.objects.create(
            product=old_item,
            purchase_date=old_item.purchase_date,
            watch_cost=Decimal("5000.00"),
            shipping_cost=Decimal("0.00"),
            maintenance_cost=Decimal("0.00"),
            other_costs=Decimal("0.00"),
        )
        layaway = Layaway.objects.create(
            product=self.item,
            client=self.customer,
            agreed_price=Decimal("8500.00"),
            due_date=timezone.localdate() - timezone.timedelta(days=2),
            start_date=timezone.localdate() - timezone.timedelta(days=7),
            created_by=self.user,
            updated_by=self.user,
        )
        self.item.status = InventoryItem.STATUS_RESERVED
        self.item.save()

        response = self.client.get("/api/notifications/")

        self.assertEqual(response.status_code, 200)
        categories = {item["category"] for item in response.data["items"]}
        self.assertIn("layaway_overdue", categories)
        self.assertIn("inventory_old", categories)
        self.assertGreaterEqual(response.data["counts"]["layaway_overdue"], 1)
        self.assertGreaterEqual(response.data["counts"]["inventory_old"], 1)
        layaway.refresh_from_db()
