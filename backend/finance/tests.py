from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from clients.models import Client
from finance.models import FinanceEntry
from inventory.models import InventoryItem, PurchaseCost
from layaways.models import Layaway, LayawayPayment
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

    def test_finance_entries_crud_and_updates_automatic_sources(self):
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

        sale = Sale.objects.create(
            client=self.customer,
            product=self.product,
            sale_date=timezone.localdate(),
            payment_method="cash",
            sales_channel="direct",
            amount_paid=Decimal("210.00"),
            cost_snapshot=Decimal("50.00"),
            created_by=self.user,
            updated_by=self.user,
        )
        automatic_entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_SALE,
            amount=Decimal("210.00"),
            account=FinanceEntry.ACCOUNT_CASH,
            entry_date=timezone.localdate(),
            sale=sale,
            product=self.product,
            created_by=self.user,
            updated_by=self.user,
            is_automatic=True,
        )
        automatic_response = self.client.patch(
            f"/api/finance/entries/{automatic_entry.id}/",
            {
                "amount": "240.00",
                "account": FinanceEntry.ACCOUNT_BBVA,
                "entry_date": str(timezone.localdate()),
                "notes": "Venta ajustada",
            },
            format="json",
        )
        self.assertEqual(automatic_response.status_code, 200)
        sale.refresh_from_db()
        automatic_entry.refresh_from_db()
        self.assertEqual(str(sale.amount_paid), "240.00")
        self.assertEqual(sale.payment_method, "transfer")
        self.assertEqual(str(automatic_entry.amount), "240.00")
        self.assertEqual(automatic_entry.account, FinanceEntry.ACCOUNT_BBVA)

        purchase_entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_EXPENSE,
            concept=FinanceEntry.CONCEPT_PURCHASE,
            amount=Decimal("50.00"),
            account=FinanceEntry.ACCOUNT_CASH,
            entry_date=self.product.purchase_date,
            product=self.product,
            notes="Compra original",
            created_by=self.user,
            updated_by=self.user,
            is_automatic=True,
        )
        purchase_response = self.client.patch(
            f"/api/finance/entries/{purchase_entry.id}/",
            {
                "amount": "70.00",
                "account": FinanceEntry.ACCOUNT_BBVA,
                "entry_date": str(timezone.localdate() - timezone.timedelta(days=1)),
                "notes": "Compra ajustada",
            },
            format="json",
        )
        self.assertEqual(purchase_response.status_code, 200)
        purchase_entry.refresh_from_db()
        purchase_cost = PurchaseCost.objects.get(product=self.product)
        self.product.refresh_from_db()
        self.assertEqual(str(purchase_cost.total_pagado), "70.00")
        self.assertEqual(purchase_cost.source_account, FinanceEntry.ACCOUNT_BBVA)
        self.assertEqual(str(purchase_entry.amount), "70.00")
        self.assertEqual(self.product.purchase_date, timezone.localdate() - timezone.timedelta(days=1))

        layaway = Layaway.objects.create(
            product=self.product,
            client=self.customer,
            agreed_price=Decimal("300.00"),
            start_date=timezone.localdate(),
            created_by=self.user,
            updated_by=self.user,
        )
        self.product.status = InventoryItem.STATUS_RESERVED
        self.product.save()
        payment = LayawayPayment.objects.create(
            layaway=layaway,
            payment_date=timezone.localdate(),
            amount=Decimal("100.00"),
            payment_method="cash",
            account=FinanceEntry.ACCOUNT_CASH,
            notes="Primer abono",
            created_by=self.user,
            updated_by=self.user,
        )
        layaway.save()
        payment_entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_LAYAWAY_PAYMENT,
            amount=payment.amount,
            account=payment.account,
            entry_date=payment.payment_date,
            product=layaway.product,
            notes=payment.notes,
            created_by=self.user,
            updated_by=self.user,
            is_automatic=True,
        )
        payment.finance_entry = payment_entry
        payment.save(update_fields=["finance_entry"])

        layaway_response = self.client.patch(
            f"/api/finance/entries/{payment_entry.id}/",
            {
                "amount": "150.00",
                "account": FinanceEntry.ACCOUNT_BBVA,
                "entry_date": str(timezone.localdate()),
                "notes": "Abono ajustado",
            },
            format="json",
        )
        self.assertEqual(layaway_response.status_code, 200)
        payment.refresh_from_db()
        payment_entry.refresh_from_db()
        layaway.refresh_from_db()
        self.assertEqual(str(payment.amount), "150.00")
        self.assertEqual(payment.account, FinanceEntry.ACCOUNT_BBVA)
        self.assertEqual(str(layaway.amount_paid), "150.00")
        self.assertEqual(str(layaway.balance_due), "150.00")
        self.assertEqual(str(payment_entry.amount), "150.00")

    def test_editing_completed_layaway_payment_reopens_layaway(self):
        self.client.force_authenticate(user=self.user)
        layaway = Layaway.objects.create(
            product=self.product,
            client=self.customer,
            agreed_price=Decimal("200.00"),
            start_date=timezone.localdate() - timezone.timedelta(days=2),
            amount_paid=Decimal("200.00"),
            balance_due=Decimal("0.00"),
            status=Layaway.STATUS_COMPLETED,
            created_by=self.user,
            updated_by=self.user,
        )
        sale = Sale.objects.create(
            client=self.customer,
            product=self.product,
            sale_date=timezone.localdate(),
            payment_method="cash",
            sales_channel="direct",
            amount_paid=Decimal("200.00"),
            cost_snapshot=Decimal("50.00"),
            created_by=self.user,
            updated_by=self.user,
        )
        layaway.sale = sale
        layaway.save(update_fields=["sale", "updated_at"])
        self.product.status = InventoryItem.STATUS_SOLD
        self.product.sold_date = timezone.localdate()
        self.product.save()
        payment = LayawayPayment.objects.create(
            layaway=layaway,
            payment_date=timezone.localdate(),
            amount=Decimal("200.00"),
            payment_method="cash",
            account=FinanceEntry.ACCOUNT_CASH,
            notes="Liquidacion",
            created_by=self.user,
            updated_by=self.user,
        )
        payment_entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_LAYAWAY_PAYMENT,
            amount=Decimal("200.00"),
            account=FinanceEntry.ACCOUNT_CASH,
            entry_date=timezone.localdate(),
            product=self.product,
            notes="Liquidacion",
            created_by=self.user,
            updated_by=self.user,
            is_automatic=True,
        )
        payment.finance_entry = payment_entry
        payment.save(update_fields=["finance_entry"])

        response = self.client.patch(
            f"/api/finance/entries/{payment_entry.id}/",
            {"amount": "120.00"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        layaway.refresh_from_db()
        sale.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(layaway.status, Layaway.STATUS_ACTIVE)
        self.assertIsNone(layaway.sale_id)
        self.assertTrue(sale.is_deleted)
        self.assertEqual(self.product.status, InventoryItem.STATUS_RESERVED)
        self.assertEqual(str(layaway.balance_due), "80.00")

    def test_editing_unlinked_layaway_finance_entry_finds_payment(self):
        self.client.force_authenticate(user=self.user)
        layaway = Layaway.objects.create(
            product=self.product,
            client=self.customer,
            agreed_price=Decimal("250.00"),
            start_date=timezone.localdate(),
            created_by=self.user,
            updated_by=self.user,
        )
        self.product.status = InventoryItem.STATUS_RESERVED
        self.product.save()
        payment = LayawayPayment.objects.create(
            layaway=layaway,
            payment_date=timezone.localdate(),
            amount=Decimal("100.00"),
            payment_method="cash",
            account=FinanceEntry.ACCOUNT_CASH,
            notes="Abono legado",
            created_by=self.user,
            updated_by=self.user,
        )
        orphan_entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_LAYAWAY_PAYMENT,
            amount=Decimal("100.00"),
            account=FinanceEntry.ACCOUNT_CASH,
            entry_date=timezone.localdate(),
            product=self.product,
            notes="Abono legado",
            created_by=self.user,
            updated_by=self.user,
            is_automatic=True,
        )

        response = self.client.patch(
            f"/api/finance/entries/{orphan_entry.id}/",
            {"amount": "130.00", "account": FinanceEntry.ACCOUNT_BBVA},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        payment.refresh_from_db()
        orphan_entry.refresh_from_db()
        layaway.refresh_from_db()
        self.assertEqual(payment.finance_entry_id, orphan_entry.id)
        self.assertEqual(str(payment.amount), "130.00")
        self.assertEqual(payment.account, FinanceEntry.ACCOUNT_BBVA)
        self.assertEqual(str(layaway.amount_paid), "130.00")
        self.assertEqual(str(layaway.balance_due), "120.00")

    def test_deleting_automatic_entries_deletes_related_records(self):
        self.client.force_authenticate(user=self.user)

        sale = Sale.objects.create(
            client=self.customer,
            product=self.product,
            sale_date=timezone.localdate(),
            payment_method="cash",
            sales_channel="direct",
            amount_paid=Decimal("220.00"),
            cost_snapshot=Decimal("50.00"),
            created_by=self.user,
            updated_by=self.user,
        )
        self.product.status = InventoryItem.STATUS_SOLD
        self.product.sold_date = timezone.localdate()
        self.product.save()
        sale_entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_SALE,
            amount=Decimal("220.00"),
            account=FinanceEntry.ACCOUNT_CASH,
            entry_date=timezone.localdate(),
            sale=sale,
            product=self.product,
            created_by=self.user,
            updated_by=self.user,
            is_automatic=True,
        )

        sale_delete = self.client.delete(f"/api/finance/entries/{sale_entry.id}/")

        self.assertEqual(sale_delete.status_code, 204)
        sale.refresh_from_db()
        sale_entry.refresh_from_db()
        self.product.refresh_from_db()
        self.assertTrue(sale.is_deleted)
        self.assertTrue(sale_entry.is_deleted)
        self.assertEqual(self.product.status, InventoryItem.STATUS_AVAILABLE)

        purchase_entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_EXPENSE,
            concept=FinanceEntry.CONCEPT_PURCHASE,
            amount=Decimal("50.00"),
            account=FinanceEntry.ACCOUNT_CASH,
            entry_date=self.product.purchase_date,
            product=self.product,
            notes="Compra original",
            created_by=self.user,
            updated_by=self.user,
            is_automatic=True,
        )

        purchase_delete = self.client.delete(f"/api/finance/entries/{purchase_entry.id}/")

        self.assertEqual(purchase_delete.status_code, 403)
        purchase_entry.refresh_from_db()
        self.assertFalse(purchase_entry.is_deleted)
        self.assertTrue(PurchaseCost.objects.filter(product=self.product).exists())

        layaway = Layaway.objects.create(
            product=self.product,
            client=self.customer,
            agreed_price=Decimal("250.00"),
            start_date=timezone.localdate(),
            created_by=self.user,
            updated_by=self.user,
        )
        self.product.status = InventoryItem.STATUS_RESERVED
        self.product.save()
        payment = LayawayPayment.objects.create(
            layaway=layaway,
            payment_date=timezone.localdate(),
            amount=Decimal("100.00"),
            payment_method="cash",
            account=FinanceEntry.ACCOUNT_CASH,
            notes="Abono",
            created_by=self.user,
            updated_by=self.user,
        )
        payment_entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_LAYAWAY_PAYMENT,
            amount=Decimal("100.00"),
            account=FinanceEntry.ACCOUNT_CASH,
            entry_date=timezone.localdate(),
            product=self.product,
            notes="Abono",
            created_by=self.user,
            updated_by=self.user,
            is_automatic=True,
        )
        payment.finance_entry = payment_entry
        payment.save(update_fields=["finance_entry"])
        layaway.save()

        layaway_delete = self.client.delete(f"/api/finance/entries/{payment_entry.id}/")

        self.assertEqual(layaway_delete.status_code, 204)
        payment.refresh_from_db()
        payment_entry.refresh_from_db()
        layaway.refresh_from_db()
        self.assertTrue(payment.is_deleted)
        self.assertTrue(payment_entry.is_deleted)
        self.assertEqual(str(layaway.amount_paid), "0.00")
        self.assertEqual(str(layaway.balance_due), "250.00")
