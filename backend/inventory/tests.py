from decimal import Decimal
from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from finance.models import FinanceEntry

from .models import InventoryItem, PurchaseCost, PurchaseCostLine


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

    def test_create_inventory_item_creates_purchase_cost_and_finance_entry(self):
        payload = {
            "brand": "Seiko",
            "model_name": "Prospex Diver 200M",
            "year_label": "2019",
            "condition_score": "9.5",
            "provider": "Coleccionista local",
            "description": "Reloj en excelente estado.",
            "notes": "Sin caja",
            "price": "9200.00",
            "purchase_date": str(timezone.localdate()),
            "status": "available",
            "sales_channel": "instagram",
            "image_url": "https://example.com/watch.jpg",
            "purchase_cost": {
                "watch_cost": "5500.00",
                "shipping_cost": "250.00",
                "maintenance_cost": "500.00",
                "other_costs": "100.00",
                "payment_method": "cash",
                "source_account": "cash",
                "notes": "Compra local",
            },
        }

        response = self.client.post("/api/inventory/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        item = InventoryItem.objects.get()
        purchase_cost = PurchaseCost.objects.get(product=item)
        finance_entries = FinanceEntry.objects.filter(product=item, concept=FinanceEntry.CONCEPT_PURCHASE)
        self.assertTrue(item.product_id.startswith("SEI-"))
        self.assertEqual(item.sku, item.product_id)
        self.assertEqual(item.tag, "new")
        self.assertEqual(str(purchase_cost.total_pagado), "6350.00")
        self.assertEqual(PurchaseCostLine.objects.filter(product=item).count(), 4)
        self.assertEqual(finance_entries.count(), 4)
        self.assertEqual(sum(entry.amount for entry in finance_entries), Decimal("6350.00"))
        self.assertEqual(
            set(finance_entries.values_list("entry_type", flat=True)),
            {FinanceEntry.TYPE_EXPENSE},
        )

    def test_inventory_exposes_metrics_from_purchase_cost(self):
        item = InventoryItem.objects.create(
            brand="Bulova",
            model_name="Accutron",
            name="Bulova Accutron",
            product_id="BUL-031",
            sku="BUL-031",
            year_label="70's",
            condition_score="8.0",
            price="3200.00",
            purchase_date=timezone.localdate() - timezone.timedelta(days=5),
            status="available",
            sales_channel="whatsapp",
            stock=1,
            created_by=self.user,
            updated_by=self.user,
        )
        PurchaseCost.objects.create(
            product=item,
            purchase_date=item.purchase_date,
            watch_cost="1800.00",
            shipping_cost="100.00",
            maintenance_cost="150.00",
            other_costs="0.00",
        )

        response = self.client.get(f"/api/inventory/{item.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["display_name"], "Bulova Accutron")
        self.assertEqual(response.data["days_in_inventory"], 5)
        self.assertEqual(response.data["total_cost"], "2050.00")
        self.assertEqual(response.data["estimated_profit"], "1150.00")
        self.assertEqual(response.data["utilidad"], 35.9)
        self.assertEqual(response.data["age_tag"], "new")

    def test_inventory_stops_counting_days_after_sale(self):
        purchase_date = timezone.localdate() - timezone.timedelta(days=12)
        sold_at = timezone.now() - timezone.timedelta(days=4)
        item = InventoryItem.objects.create(
            brand="Citizen",
            model_name="Eco-Drive",
            name="Citizen Eco-Drive",
            product_id="CIT-012",
            sku="CIT-012",
            price="3500.00",
            cost_price="2000.00",
            purchase_date=purchase_date,
            status="sold",
            sold_at=sold_at,
            sold_date=timezone.localdate(sold_at),
            days_to_sell=8,
            stock=0,
            is_active=False,
        )

        response = self.client.get(f"/api/inventory/{item.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["days_in_inventory"], 8)

    def test_delete_inventory_item_is_soft_delete(self):
        item = InventoryItem.objects.create(
            brand="Omega",
            model_name="Speedmaster",
            name="Omega Speedmaster",
            product_id="OME-001",
            sku="OME-001",
            price="15000.00",
            purchase_date=timezone.localdate(),
        )

        response = self.client.delete(f"/api/inventory/{item.id}/")

        self.assertEqual(response.status_code, 204)
        item.refresh_from_db()
        self.assertTrue(item.is_deleted)

    def test_import_csv_creates_inventory_items(self):
        csv_content = (
            "marca,modelo,precio,fecha_compra,estado,canal_venta,costo_reloj,costo_envio,costo_mantenimiento\n"
            "Seiko,5 Sports,4500.00,2026-03-01,disponible,instagram,2500.00,100.00,50.00\n"
            "Casio,G-Shock 5600,3200.00,2026-03-05,apartado,whatsapp,1800.00,80.00,20.00\n"
        )
        from django.core.files.uploadedfile import SimpleUploadedFile

        file_obj = SimpleUploadedFile("inventario.csv", csv_content.encode("utf-8"), content_type="text/csv")

        response = self.client.post("/api/inventory/import-csv/", {"file": file_obj}, format="multipart")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["created"], 2)
        self.assertEqual(response.data["failed"], 0)
        self.assertEqual(InventoryItem.objects.count(), 2)
        self.assertEqual(PurchaseCost.objects.count(), 2)
        self.assertEqual(PurchaseCostLine.objects.count(), 6)
        self.assertEqual(FinanceEntry.objects.filter(concept=FinanceEntry.CONCEPT_PURCHASE).count(), 6)

    def test_import_csv_returns_row_errors_when_data_is_invalid(self):
        csv_content = (
            "marca,modelo,precio,fecha_compra\n"
            "Seiko,5 Sports,4500.00,2026-03-01\n"
            "Casio,G-Shock 5600,,-\n"
        )
        from django.core.files.uploadedfile import SimpleUploadedFile

        file_obj = SimpleUploadedFile("inventario.csv", csv_content.encode("utf-8"), content_type="text/csv")

        response = self.client.post("/api/inventory/import-csv/", {"file": file_obj}, format="multipart")

        self.assertEqual(response.status_code, 207)
        self.assertEqual(response.data["created"], 1)
        self.assertEqual(response.data["failed"], 1)
        self.assertEqual(len(response.data["errors"]), 1)

    def test_backfill_purchase_cost_lines_command_is_idempotent(self):
        item = InventoryItem.objects.create(
            brand="Hamilton",
            model_name="Khaki",
            name="Hamilton Khaki",
            product_id="HAM-001",
            sku="HAM-001",
            price="8000.00",
            purchase_date=timezone.localdate(),
            created_by=self.user,
            updated_by=self.user,
        )
        purchase_cost = PurchaseCost.objects.create(
            product=item,
            purchase_date=item.purchase_date,
            watch_cost="4500.00",
            shipping_cost="250.00",
            maintenance_cost="0.00",
            other_costs="100.00",
            payment_method="transfer",
            source_account=FinanceEntry.ACCOUNT_BBVA,
            notes="Legacy",
        )
        legacy_entry = FinanceEntry.objects.create(
            product=item,
            concept=FinanceEntry.CONCEPT_PURCHASE,
            entry_type=FinanceEntry.TYPE_EXPENSE,
            amount=purchase_cost.total_pagado,
            account=FinanceEntry.ACCOUNT_BBVA,
            entry_date=item.purchase_date,
            is_automatic=True,
        )

        output = StringIO()
        call_command("backfill_purchase_cost_lines", stdout=output)
        call_command("backfill_purchase_cost_lines", stdout=output)

        legacy_entry.refresh_from_db()
        self.assertTrue(legacy_entry.is_deleted)
        self.assertEqual(PurchaseCostLine.objects.filter(product=item).count(), 3)
        self.assertEqual(
            FinanceEntry.objects.filter(
                product=item,
                concept=FinanceEntry.CONCEPT_PURCHASE,
                purchase_cost_line__isnull=False,
            ).count(),
            3,
        )

    def test_backfill_purchase_cost_lines_skips_existing_type_even_if_amount_changed(self):
        item = InventoryItem.objects.create(
            brand="Longines",
            model_name="Conquest",
            name="Longines Conquest",
            product_id="LON-001",
            sku="LON-001",
            price="12000.00",
            purchase_date=timezone.localdate(),
        )
        PurchaseCost.objects.create(
            product=item,
            purchase_date=item.purchase_date,
            watch_cost="9000.00",
            shipping_cost="0.00",
            maintenance_cost="0.00",
            other_costs="0.00",
            payment_method="transfer",
            source_account=FinanceEntry.ACCOUNT_BBVA,
        )
        PurchaseCostLine.objects.create(
            product=item,
            cost_type=PurchaseCostLine.TYPE_WATCH,
            amount="9100.00",
            account=FinanceEntry.ACCOUNT_CASH,
            payment_method="cash",
            cost_date=item.purchase_date,
        )

        output = StringIO()
        call_command("backfill_purchase_cost_lines", stdout=output)

        self.assertEqual(
            PurchaseCostLine.objects.filter(product=item, cost_type=PurchaseCostLine.TYPE_WATCH).count(),
            1,
        )

    def test_dedupe_purchase_cost_lines_command_soft_deletes_only_duplicates(self):
        item = InventoryItem.objects.create(
            brand="Omega",
            model_name="Seamaster",
            name="Omega Seamaster",
            product_id="OMG-777",
            sku="OMG-777",
            price="30000.00",
            purchase_date=timezone.localdate(),
        )
        keep_watch = PurchaseCostLine.objects.create(
            product=item,
            cost_type=PurchaseCostLine.TYPE_WATCH,
            amount="20000.00",
            account=FinanceEntry.ACCOUNT_CASH,
            payment_method="cash",
            cost_date=item.purchase_date,
        )
        duplicate_watch = PurchaseCostLine.objects.create(
            product=item,
            cost_type=PurchaseCostLine.TYPE_WATCH,
            amount="20000.00",
            account=FinanceEntry.ACCOUNT_CASH,
            payment_method="cash",
            cost_date=item.purchase_date,
        )
        keep_shipping = PurchaseCostLine.objects.create(
            product=item,
            cost_type=PurchaseCostLine.TYPE_SHIPPING,
            amount="250.00",
            account=FinanceEntry.ACCOUNT_BBVA,
            payment_method="transfer",
            cost_date=item.purchase_date,
            notes="Envio",
        )
        duplicate_shipping = PurchaseCostLine.objects.create(
            product=item,
            cost_type=PurchaseCostLine.TYPE_SHIPPING,
            amount="250.00",
            account=FinanceEntry.ACCOUNT_BBVA,
            payment_method="transfer",
            cost_date=item.purchase_date,
            notes="Envio",
        )
        real_second_shipping = PurchaseCostLine.objects.create(
            product=item,
            cost_type=PurchaseCostLine.TYPE_SHIPPING,
            amount="300.00",
            account=FinanceEntry.ACCOUNT_BBVA,
            payment_method="transfer",
            cost_date=item.purchase_date,
            notes="Envio posterior",
        )
        duplicate_entry = FinanceEntry.objects.create(
            product=item,
            concept=FinanceEntry.CONCEPT_PURCHASE,
            entry_type=FinanceEntry.TYPE_EXPENSE,
            amount="250.00",
            account=FinanceEntry.ACCOUNT_BBVA,
            entry_date=item.purchase_date,
            is_automatic=True,
        )
        duplicate_shipping.finance_entry = duplicate_entry
        duplicate_shipping.save(update_fields=["finance_entry"])
        legacy_entry = FinanceEntry.objects.create(
            product=item,
            concept=FinanceEntry.CONCEPT_PURCHASE,
            entry_type=FinanceEntry.TYPE_EXPENSE,
            amount="20550.00",
            account=FinanceEntry.ACCOUNT_BBVA,
            entry_date=item.purchase_date,
            is_automatic=True,
        )

        output = StringIO()
        call_command("dedupe_purchase_cost_lines", "--apply", stdout=output)

        for line in [keep_watch, keep_shipping, real_second_shipping]:
            line.refresh_from_db()
            self.assertFalse(line.is_deleted)
        for line in [duplicate_watch, duplicate_shipping]:
            line.refresh_from_db()
            self.assertTrue(line.is_deleted)

        duplicate_entry.refresh_from_db()
        legacy_entry.refresh_from_db()
        self.assertTrue(duplicate_entry.is_deleted)
        self.assertTrue(legacy_entry.is_deleted)

    def test_inventory_rejects_duplicate_watch_cost_lines(self):
        payload = {
            "brand": "Seiko",
            "model_name": "5 Sports",
            "price": "5000.00",
            "purchase_date": str(timezone.localdate()),
            "purchase_costs": [
                {
                    "cost_type": "watch",
                    "amount": "2500.00",
                    "account": "cash",
                    "payment_method": "cash",
                    "cost_date": str(timezone.localdate()),
                },
                {
                    "cost_type": "watch",
                    "amount": "2600.00",
                    "account": "bbva",
                    "payment_method": "transfer",
                    "cost_date": str(timezone.localdate()),
                },
            ],
        }

        response = self.client.post("/api/inventory/", payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("purchase_costs.1.cost_type", response.data)

    def test_watch_cost_line_cannot_be_added_or_deleted_after_existing(self):
        item = InventoryItem.objects.create(
            brand="Casio",
            model_name="G-Shock",
            name="Casio G-Shock",
            product_id="CAS-001",
            sku="CAS-001",
            price="4200.00",
            purchase_date=timezone.localdate(),
        )
        watch_line = PurchaseCostLine.objects.create(
            product=item,
            cost_type=PurchaseCostLine.TYPE_WATCH,
            amount="2500.00",
            account=FinanceEntry.ACCOUNT_CASH,
            payment_method="cash",
            cost_date=item.purchase_date,
        )

        add_response = self.client.post(
            f"/api/inventory/{item.id}/costs/",
            {
                "cost_type": "watch",
                "amount": "2600.00",
                "account": "bbva",
                "payment_method": "transfer",
                "cost_date": str(timezone.localdate()),
            },
            format="json",
        )
        delete_response = self.client.delete(f"/api/inventory/{item.id}/costs/{watch_line.id}/")

        self.assertEqual(add_response.status_code, 400)
        self.assertEqual(delete_response.status_code, 400)
        self.assertFalse(PurchaseCostLine.objects.get(id=watch_line.id).is_deleted)
