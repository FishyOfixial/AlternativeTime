from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from clients.models import Client
from finance.models import FinanceEntry
from inventory.models import InventoryItem, PurchaseCost
from sales.models import Sale


class TestFinanceSummaryApi(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="finance-user",
            password="Secret123!",
        )
        self.customer = Client.objects.create(name="Finance Client", phone="555-400-1000")
        self.product = InventoryItem.objects.create(
            brand="Omega",
            model_name="Speedmaster",
            name="Omega Speedmaster",
            product_id="OME-002",
            sku="OME-002",
            price=Decimal("100.00"),
            purchase_date=timezone.localdate(),
        )
        PurchaseCost.objects.create(
            product=self.product,
            purchase_date=self.product.purchase_date,
            watch_cost=Decimal("50.00"),
            shipping_cost=Decimal("0.00"),
            maintenance_cost=Decimal("0.00"),
            other_costs=Decimal("0.00"),
        )

    def test_finance_summary_requires_authentication(self):
        response = self.client.get("/api/finance/summary/")

        self.assertEqual(response.status_code, 401)

    def test_finance_summary_returns_aggregated_sales_metrics(self):
        Sale.objects.create(
            client=self.customer,
            product=self.product,
            sale_date=timezone.localdate(),
            payment_method="cash",
            sales_channel="direct",
            amount_paid=Decimal("200.00"),
            cost_snapshot=Decimal("50.00"),
            gross_profit=Decimal("150.00"),
            created_by=self.user,
            updated_by=self.user,
        )
        FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_SALE,
            amount=Decimal("200.00"),
            account=FinanceEntry.ACCOUNT_CASH,
            entry_date=timezone.localdate(),
            notes="Ingreso manual",
            created_by=self.user,
            updated_by=self.user,
            is_automatic=False,
        )
        FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_EXPENSE,
            concept=FinanceEntry.CONCEPT_PURCHASE,
            amount=Decimal("50.00"),
            account=FinanceEntry.ACCOUNT_CASH,
            entry_date=timezone.localdate(),
            notes="Egreso manual",
            created_by=self.user,
            updated_by=self.user,
            is_automatic=False,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/finance/summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_sales_count"], 1)
        self.assertEqual(Decimal(response.data["gross_revenue"]), Decimal("200.00"))
        self.assertEqual(Decimal(response.data["total_income"]), Decimal("200.00"))
        self.assertEqual(Decimal(response.data["total_expense"]), Decimal("50.00"))
        self.assertEqual(Decimal(response.data["net_balance"]), Decimal("150.00"))

    def test_finance_balances_returns_accounts(self):
        FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_SALE,
            amount=Decimal("120.00"),
            account=FinanceEntry.ACCOUNT_CASH,
            entry_date=timezone.localdate(),
            created_by=self.user,
            updated_by=self.user,
            is_automatic=False,
        )
        FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_SALE,
            amount=Decimal("80.00"),
            account=FinanceEntry.ACCOUNT_BBVA,
            entry_date=timezone.localdate(),
            created_by=self.user,
            updated_by=self.user,
            is_automatic=False,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/finance/balances/")

        self.assertEqual(response.status_code, 200)
        accounts = {item["account"] for item in response.data}
        self.assertIn(FinanceEntry.ACCOUNT_CASH, accounts)
        self.assertIn(FinanceEntry.ACCOUNT_BBVA, accounts)

    def test_finance_entries_crud_and_blocks_automatic(self):
        self.client.force_authenticate(user=self.user)

        create_response = self.client.post(
            "/api/finance/entries/",
            {
                "entry_date": str(timezone.localdate()),
                "entry_type": FinanceEntry.TYPE_INCOME,
                "concept": FinanceEntry.CONCEPT_SALE,
                "amount": "100.00",
                "account": FinanceEntry.ACCOUNT_CASH,
                "notes": "Manual",
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, 201)

        entry_id = create_response.data["id"]
        patch_response = self.client.patch(
            f"/api/finance/entries/{entry_id}/",
            {"amount": "120.00"},
            format="json",
        )
        self.assertEqual(patch_response.status_code, 200)

        delete_response = self.client.delete(f"/api/finance/entries/{entry_id}/")
        self.assertEqual(delete_response.status_code, 204)

        automatic_entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_SALE,
            amount=Decimal("60.00"),
            account=FinanceEntry.ACCOUNT_CASH,
            entry_date=timezone.localdate(),
            created_by=self.user,
            updated_by=self.user,
            is_automatic=True,
        )
        blocked_response = self.client.patch(
            f"/api/finance/entries/{automatic_entry.id}/",
            {"amount": "70.00"},
            format="json",
        )
        self.assertEqual(blocked_response.status_code, 403)
