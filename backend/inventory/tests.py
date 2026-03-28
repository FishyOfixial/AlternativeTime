from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from finance.models import FinanceEntry

from .models import InventoryItem, PurchaseCost


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
            "purchase_date": "2026-03-01",
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
        finance_entry = FinanceEntry.objects.get(product=item)
        self.assertTrue(item.product_id.startswith("SEI-"))
        self.assertEqual(item.sku, item.product_id)
        self.assertEqual(item.tag, "new")
        self.assertEqual(str(purchase_cost.total_pagado), "6350.00")
        self.assertEqual(finance_entry.entry_type, FinanceEntry.TYPE_EXPENSE)
        self.assertEqual(str(finance_entry.amount), "6350.00")

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
        self.assertEqual(FinanceEntry.objects.filter(concept=FinanceEntry.CONCEPT_PURCHASE).count(), 2)

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
