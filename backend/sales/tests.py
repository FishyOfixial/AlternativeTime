from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from clients.models import Client
from finance.models import FinanceEntry
from inventory.models import InventoryItem, PurchaseCost
from layaways.models import Layaway, LayawayPayment

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
        finance_entry = FinanceEntry.objects.get(sale=sale, concept=FinanceEntry.CONCEPT_SALE)
        self.assertEqual(sale.client, self.customer)
        self.assertEqual(sale.product, self.item)
        self.assertEqual(str(sale.cost_snapshot), "18500.00")
        self.assertEqual(str(sale.gross_profit), "5200.00")
        self.assertEqual(str(sale.profit_percentage), "0.2080")
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

    def test_sale_can_be_updated_with_same_sold_product(self):
        sale = Sale.objects.create(
            client=self.customer,
            product=self.item,
            sale_date=timezone.localdate(),
            payment_method="transfer",
            sales_channel="instagram",
            amount_paid=Decimal("25000.00"),
            cost_snapshot=Decimal("19000.00"),
            created_by=self.user,
            updated_by=self.user,
        )
        self.item.status = InventoryItem.STATUS_SOLD
        self.item.sold_date = sale.sale_date
        self.item.days_to_sell = 10
        self.item.save()
        FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_SALE,
            amount=Decimal("25000.00"),
            account="bbva",
            entry_date=sale.sale_date,
            sale=sale,
            product=self.item,
            notes="Venta Rolex Datejust",
        )

        response = self.client.patch(
            f"/api/sales/{sale.id}/",
            {
                "customer": self.customer.id,
                "product": self.item.id,
                "sale_date": str(timezone.localdate()),
                "payment_method": "cash",
                "sales_channel": "direct",
                "amount_paid": "26000.00",
                "extras": "500.00",
                "sale_shipping_cost": "200.00",
                "notes": "Ajuste de venta",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        sale.refresh_from_db()
        finance_entry = FinanceEntry.objects.get(sale=sale, concept=FinanceEntry.CONCEPT_SALE)
        self.assertEqual(str(sale.amount_paid), "26000.00")
        self.assertEqual(str(sale.gross_profit), "6800.00")
        self.assertEqual(sale.payment_method, "cash")
        self.assertEqual(finance_entry.account, "cash")
        self.assertEqual(str(finance_entry.amount), "26000.00")

    def test_update_sale_deduplicates_existing_sale_finance_entries(self):
        sale = Sale.objects.create(
            client=self.customer,
            product=self.item,
            sale_date=timezone.localdate(),
            payment_method="transfer",
            sales_channel="instagram",
            amount_paid=Decimal("25000.00"),
            cost_snapshot=Decimal("19000.00"),
            created_by=self.user,
            updated_by=self.user,
        )
        self.item.status = InventoryItem.STATUS_SOLD
        self.item.sold_date = sale.sale_date
        self.item.days_to_sell = 10
        self.item.save()
        FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_SALE,
            amount=Decimal("25000.00"),
            account="bbva",
            entry_date=sale.sale_date,
            sale=sale,
            product=self.item,
            notes="Venta duplicada 1",
        )
        FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_SALE,
            amount=Decimal("24000.00"),
            account="cash",
            entry_date=sale.sale_date,
            sale=sale,
            product=self.item,
            notes="Venta duplicada 2",
        )

        response = self.client.patch(
            f"/api/sales/{sale.id}/",
            {
                "customer": self.customer.id,
                "product": self.item.id,
                "sale_date": str(timezone.localdate()),
                "payment_method": "cash",
                "sales_channel": "direct",
                "amount_paid": "26000.00",
                "extras": "500.00",
                "sale_shipping_cost": "200.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        active_entries = FinanceEntry.objects.filter(sale=sale, concept=FinanceEntry.CONCEPT_SALE)
        all_entries = FinanceEntry.all_objects.filter(sale=sale, concept=FinanceEntry.CONCEPT_SALE)
        self.assertEqual(active_entries.count(), 1)
        self.assertEqual(all_entries.count(), 2)
        self.assertEqual(str(active_entries.get().amount), "26000.00")
        self.assertEqual(active_entries.get().account, "cash")

    def test_update_sale_releases_previous_product_when_product_changes(self):
        second_item = InventoryItem.objects.create(
            brand="Omega",
            model_name="Seamaster",
            name="Omega Seamaster",
            product_id="OME-001",
            sku="OME-001",
            price=Decimal("30000.00"),
            purchase_date=timezone.localdate() - timezone.timedelta(days=5),
            status="available",
            created_by=self.user,
            updated_by=self.user,
        )
        PurchaseCost.objects.create(
            product=second_item,
            purchase_date=second_item.purchase_date,
            watch_cost=Decimal("20000.00"),
            payment_method="cash",
            source_account="cash",
        )
        sale = Sale.objects.create(
            client=self.customer,
            product=self.item,
            sale_date=timezone.localdate(),
            payment_method="transfer",
            sales_channel="instagram",
            amount_paid=Decimal("25000.00"),
            cost_snapshot=Decimal("19000.00"),
            created_by=self.user,
            updated_by=self.user,
        )
        self.item.status = InventoryItem.STATUS_SOLD
        self.item.sold_date = sale.sale_date
        self.item.days_to_sell = 10
        self.item.save()

        response = self.client.patch(
            f"/api/sales/{sale.id}/",
            {
                "customer": self.customer.id,
                "product": second_item.id,
                "sale_date": str(timezone.localdate()),
                "payment_method": "transfer",
                "sales_channel": "instagram",
                "amount_paid": "30000.00",
                "extras": "0.00",
                "sale_shipping_cost": "0.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.item.refresh_from_db()
        second_item.refresh_from_db()
        sale.refresh_from_db()
        self.assertEqual(self.item.status, InventoryItem.STATUS_AVAILABLE)
        self.assertIsNone(self.item.sold_date)
        self.assertEqual(second_item.status, InventoryItem.STATUS_SOLD)
        self.assertEqual(sale.product, second_item)
        self.assertEqual(str(sale.cost_snapshot), "20000.00")

    def test_update_layaway_generated_sale_updates_latest_payment_instead_of_creating_sale_entry(self):
        layaway = Layaway.objects.create(
            product=self.item,
            client=self.customer,
            agreed_price=Decimal("25000.00"),
            start_date=timezone.localdate() - timezone.timedelta(days=3),
            created_by=self.user,
            updated_by=self.user,
        )
        self.item.status = InventoryItem.STATUS_RESERVED
        self.item.save()
        first_payment = LayawayPayment.objects.create(
            layaway=layaway,
            payment_date=timezone.localdate() - timezone.timedelta(days=2),
            amount=Decimal("10000.00"),
            payment_method="cash",
            account=FinanceEntry.ACCOUNT_CASH,
            notes="Primer abono",
            created_by=self.user,
            updated_by=self.user,
        )
        first_entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_LAYAWAY_PAYMENT,
            amount=first_payment.amount,
            account=first_payment.account,
            entry_date=first_payment.payment_date,
            product=self.item,
            notes=first_payment.notes,
            created_by=self.user,
            updated_by=self.user,
            is_automatic=True,
        )
        first_payment.finance_entry = first_entry
        first_payment.save(update_fields=["finance_entry"])
        final_payment = LayawayPayment.objects.create(
            layaway=layaway,
            payment_date=timezone.localdate(),
            amount=Decimal("15000.00"),
            payment_method="transfer",
            account=FinanceEntry.ACCOUNT_BBVA,
            notes="Liquidacion",
            created_by=self.user,
            updated_by=self.user,
        )
        final_entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_LAYAWAY_PAYMENT,
            amount=final_payment.amount,
            account=final_payment.account,
            entry_date=final_payment.payment_date,
            product=self.item,
            notes=final_payment.notes,
            created_by=self.user,
            updated_by=self.user,
            is_automatic=True,
        )
        final_payment.finance_entry = final_entry
        final_payment.save(update_fields=["finance_entry"])
        sale = Sale.objects.create(
            client=self.customer,
            product=self.item,
            sale_date=final_payment.payment_date,
            payment_method=final_payment.payment_method,
            sales_channel="direct",
            amount_paid=Decimal("25000.00"),
            extras=Decimal("0.00"),
            sale_shipping_cost=Decimal("0.00"),
            cost_snapshot=Decimal("19000.00"),
            created_by=self.user,
            updated_by=self.user,
        )
        layaway.sale = sale
        layaway.amount_paid = Decimal("25000.00")
        layaway.balance_due = Decimal("0.00")
        layaway.status = Layaway.STATUS_COMPLETED
        layaway.save(update_fields=["sale", "amount_paid", "balance_due", "status", "updated_at"])
        self.item.status = InventoryItem.STATUS_SOLD
        self.item.sold_date = sale.sale_date
        self.item.save()
        legacy_sale_entry = FinanceEntry.objects.create(
            entry_type=FinanceEntry.TYPE_INCOME,
            concept=FinanceEntry.CONCEPT_SALE,
            amount=Decimal("25000.00"),
            account=FinanceEntry.ACCOUNT_BBVA,
            entry_date=sale.sale_date,
            sale=sale,
            product=self.item,
            notes="Duplicado legado",
            created_by=self.user,
            updated_by=self.user,
            is_automatic=True,
        )

        response = self.client.patch(
            f"/api/sales/{sale.id}/",
            {
                "amount_paid": "26000.00",
                "payment_method": "cash",
                "sale_date": str(timezone.localdate() - timezone.timedelta(days=1)),
                "sales_channel": "instagram",
                "extras": "500.00",
                "sale_shipping_cost": "200.00",
                "notes": "Ajuste apartado",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        sale.refresh_from_db()
        layaway.refresh_from_db()
        final_payment.refresh_from_db()
        final_entry.refresh_from_db()
        legacy_sale_entry.refresh_from_db()
        self.assertEqual(str(sale.amount_paid), "26000.00")
        self.assertEqual(sale.payment_method, "cash")
        self.assertEqual(sale.sales_channel, "instagram")
        self.assertEqual(str(sale.extras), "500.00")
        self.assertEqual(str(sale.sale_shipping_cost), "200.00")
        self.assertEqual(str(layaway.agreed_price), "26000.00")
        self.assertEqual(str(layaway.amount_paid), "26000.00")
        self.assertEqual(str(layaway.balance_due), "0.00")
        self.assertEqual(str(final_payment.amount), "16000.00")
        self.assertEqual(final_payment.payment_method, "cash")
        self.assertEqual(final_payment.account, FinanceEntry.ACCOUNT_CASH)
        self.assertEqual(str(final_entry.amount), "16000.00")
        self.assertEqual(final_entry.account, FinanceEntry.ACCOUNT_CASH)
        self.assertTrue(legacy_sale_entry.is_deleted)
        self.assertFalse(FinanceEntry.objects.filter(sale=sale, concept=FinanceEntry.CONCEPT_SALE).exists())
