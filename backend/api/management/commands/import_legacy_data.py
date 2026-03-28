import sqlite3
import tempfile
import os
from datetime import datetime, time
from decimal import Decimal
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from clients.models import Client
from finance.models import AccountBalance, FinanceEntry
from finance.services import recalculate_account_balance
from inventory.models import InventoryItem, PurchaseCost
from sales.models import Sale


class Command(BaseCommand):
    help = "Importa datos legacy desde un SQL hacia los modelos actuales."

    def add_arguments(self, parser):
        parser.add_argument(
            "--sql-path",
            default="",
            help="Ruta al archivo SQL legacy (obligatorio).",
        )
        parser.add_argument(
            "--excel-path",
            default="",
            help="Ruta al Excel legacy de referencia (solo validacion y trazabilidad).",
        )
        parser.add_argument(
            "--username",
            default=os.getenv("LEGACY_IMPORT_USERNAME", "admin"),
            help="Usuario a crear/usar como owner de los registros.",
        )
        parser.add_argument(
            "--password",
            default=os.getenv("LEGACY_IMPORT_PASSWORD", "admin"),
            help="Password del usuario.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        sql_raw_path = str(options["sql_path"] or "").strip()
        if not sql_raw_path:
            raise CommandError("Debes indicar --sql-path con el archivo SQL a importar.")
        sql_path = Path(sql_raw_path)
        if not sql_path.exists():
            raise CommandError(f"No existe el archivo: {sql_path}")
        excel_raw_path = str(options["excel_path"] or "").strip()
        if excel_raw_path:
            excel_path = Path(excel_raw_path)
            if excel_path.exists():
                self.stdout.write(f"Excel legacy detectado: {excel_path}")
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"No se encontro el Excel legacy en {excel_path}. Continuo con SQL."
                    )
                )

        raw_sql = sql_path.read_text(encoding="utf-8", errors="replace")
        temp_fd, temp_db_path = tempfile.mkstemp(suffix=".sqlite3")
        os.close(temp_fd)
        source_conn = None
        try:
            source_conn = sqlite3.connect(temp_db_path)
            source_conn.row_factory = sqlite3.Row
            self._bootstrap_staging_tables(source_conn)
            normalized_sql = raw_sql.replace("NOW()", "CURRENT_TIMESTAMP")
            source_conn.executescript(normalized_sql)
            user = self._ensure_user(options["username"], options["password"])
            if self._table_has_rows(source_conn, "inventory_inventoryitem"):
                inventory_map = self._import_inventory_from_django_sql(source_conn, user)
                self._import_purchase_costs_from_django_sql(source_conn, inventory_map)
                sales_index = self._import_sales_from_django_sql(source_conn, inventory_map, user)
                self._import_finance_from_django_sql(source_conn, inventory_map, sales_index, user)
            else:
                inventory_map = self._import_inventory(source_conn, user)
                self._import_purchase_costs(source_conn, inventory_map)
                sales_index = self._import_sales(source_conn, inventory_map, user)
                self._import_finance(source_conn, inventory_map, sales_index, user)
            self._rebuild_balances()
        finally:
            if source_conn is not None:
                source_conn.close()
            if os.path.exists(temp_db_path):
                os.remove(temp_db_path)

        self.stdout.write(self.style.SUCCESS("Importacion legacy completada."))

    def _ensure_user(self, username, password):
        user_model = get_user_model()
        user, created = user_model.objects.get_or_create(username=username)
        user.set_password(password)
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save()
        if created:
            self.stdout.write(self.style.SUCCESS(f"Usuario creado: {username}"))
        else:
            self.stdout.write(f"Usuario actualizado: {username}")
        return user

    def _import_inventory(self, conn, user):
        inventory_map = {}
        rows = conn.execute("SELECT * FROM inventario ORDER BY id ASC").fetchall()
        for row in rows:
            product_id = (row["reloj_id"] or "").strip()
            if not product_id:
                continue

            sale_date = self._parse_date(row["fecha_venta"])
            status = self._map_inventory_status(row["estado"])
            purchase_date = self._parse_date(row["fecha_compra"]) or timezone.localdate()
            brand = self._clean_text(row["marca"]) or "Sin marca"
            model_name = self._clean_text(row["modelo"]) or "Sin modelo"
            channel = self._map_sales_channel(row["canal_venta"])
            name = f"{brand} {model_name}".strip()
            item = InventoryItem(
                product_id=product_id,
                sku=product_id,
                name=name,
                brand=brand,
                model_name=model_name,
                year_label=self._clean_text(row["anio_estilo"]),
                condition_score=self._to_decimal(row["condicion"], default=Decimal("8.0")),
                provider="",
                description="",
                notes=self._clean_text(row["action"]),
                price=self._to_decimal(row["precio_venta"]),
                purchase_date=purchase_date,
                sold_date=sale_date,
                sold_at=(
                    timezone.make_aware(datetime.combine(sale_date, time.min))
                    if sale_date
                    else None
                ),
                days_to_sell=self._to_int(row["days_to_sell"]),
                status=status,
                sales_channel=channel,
                created_by=user,
                updated_by=user,
            )
            item.save()
            inventory_map[product_id] = item
        self.stdout.write(f"Inventario importado: {len(inventory_map)}")
        return inventory_map

    def _import_inventory_from_django_sql(self, conn, user):
        inventory_map = {}
        rows = conn.execute("SELECT * FROM inventory_inventoryitem ORDER BY id ASC").fetchall()
        for row in rows:
            product_id = self._clean_text(row["product_id"])
            if not product_id:
                continue
            brand = self._clean_text(row["brand"]) or "Sin marca"
            model_name = self._clean_text(row["model_name"]) or "Sin modelo"
            purchase_date = self._parse_date(row["purchase_date"]) or timezone.localdate()
            sale_date = self._parse_date(row["sold_date"])
            status = self._map_inventory_status(row["status"])
            channel = self._map_sales_channel(row["sales_channel"])

            item = InventoryItem(
                product_id=product_id,
                sku=product_id,
                name=self._clean_text(row["name"]) or f"{brand} {model_name}",
                brand=brand,
                model_name=model_name,
                year_label=self._clean_text(row["year_label"]),
                condition_score=self._to_decimal(row["condition_score"], default=Decimal("8.0")),
                provider="",
                description="",
                notes=self._clean_text(row["notes"]),
                price=self._to_decimal(row["price"]),
                purchase_date=purchase_date,
                sold_date=sale_date,
                sold_at=(
                    timezone.make_aware(datetime.combine(sale_date, time.min))
                    if sale_date
                    else None
                ),
                days_to_sell=self._to_int(row["days_to_sell"]),
                status=status,
                sales_channel=channel,
                created_by=user,
                updated_by=user,
            )
            item.save()
            inventory_map[product_id] = item

        self.stdout.write(f"Inventario importado: {len(inventory_map)}")
        return inventory_map

    def _import_purchase_costs(self, conn, inventory_map):
        inserted = 0
        rows = conn.execute("SELECT * FROM costo_ventas ORDER BY id ASC").fetchall()
        for row in rows:
            product = inventory_map.get((row["reloj_id"] or "").strip())
            if not product:
                continue
            purchase = PurchaseCost(
                product=product,
                purchase_date=self._parse_date(row["fecha_compra"]) or product.purchase_date,
                watch_cost=self._to_decimal(row["costo_reloj"]),
                shipping_cost=self._to_decimal(row["costo_envio"]),
                maintenance_cost=self._to_decimal(row["mantenimiento"]),
                other_costs=Decimal("0.00"),
                payment_method=self._map_payment_method(row["metodo_pago"]),
                source_account=self._map_account(row["metodo_pago"]),
                notes="Importado desde legacy",
            )
            purchase.save()
            inserted += 1
        self.stdout.write(f"Costos de compra importados: {inserted}")

    def _import_purchase_costs_from_django_sql(self, conn, inventory_map):
        inserted = 0
        rows = conn.execute(
            """
            SELECT pc.*, ii.product_id AS legacy_product_id
            FROM inventory_purchasecost pc
            LEFT JOIN inventory_inventoryitem ii ON ii.id = pc.product_id_id
            ORDER BY pc.id ASC
            """
        ).fetchall()
        for row in rows:
            product = inventory_map.get(self._clean_text(row["legacy_product_id"]))
            if not product:
                continue
            purchase = PurchaseCost(
                product=product,
                purchase_date=self._parse_date(row["purchase_date"]) or product.purchase_date,
                watch_cost=self._to_decimal(row["watch_cost"]),
                shipping_cost=self._to_decimal(row["shipping_cost"]),
                maintenance_cost=self._to_decimal(row["maintenance_cost"]),
                other_costs=self._to_decimal(row["other_costs"]),
                payment_method=self._map_payment_method(row["payment_method"]),
                source_account=self._map_account(row["source_account"] or row["payment_method"]),
                notes=self._clean_text(row["notes"]),
            )
            purchase.save()
            inserted += 1
        self.stdout.write(f"Costos de compra importados: {inserted}")

    def _import_sales(self, conn, inventory_map, user):
        inserted = 0
        sales_index = self._new_sales_index()
        client_map = self._import_clients(conn, user)
        rows = conn.execute("SELECT * FROM ventas ORDER BY id ASC").fetchall()
        for row in rows:
            customer_name = self._clean_text(row["cliente"]) or "Cliente sin nombre"
            customer_contact = self._normalize_contact(row["contacto"])
            client = None
            if "cliente_id" in row.keys() and row["cliente_id"] in client_map:
                client = client_map.get(row["cliente_id"])
            if not client and customer_name:
                client, created = Client.objects.get_or_create(
                    name=customer_name,
                    defaults={
                        "phone": customer_contact,
                        "notes": "Importado desde legacy",
                        "created_by": user,
                        "updated_by": user,
                    },
                )
                if not created and not (client.phone or "").strip() and customer_contact:
                    client.phone = customer_contact
                if client.created_by_id is None:
                    client.created_by = user
                    client.updated_by = user
                client.updated_by = user
                client.save(update_fields=["phone", "created_by", "updated_by", "updated_at"])
            product = inventory_map.get((row["reloj_id"] or "").strip())

            sale = Sale(
                client=client,
                product=product,
                sale_date=self._parse_date(row["fecha_venta"]) or timezone.localdate(),
                customer_name=customer_name,
                customer_contact=customer_contact,
                payment_method=self._map_payment_method(row["metodo_pago"]),
                sales_channel=self._map_sales_channel(row["canal_venta"]),
                amount_paid=self._to_decimal(row["monto_pagado"]),
                extras=self._to_decimal(row["extras"]),
                sale_shipping_cost=self._to_decimal(row["costo_envio"]),
                cost_snapshot=self._to_decimal(row["costo_reloj"]),
                notes="Importado desde legacy",
                created_by=user,
                updated_by=user,
            )
            sale.save()
            self._index_sale(
                sales_index=sales_index,
                sale=sale,
                legacy_sale_id=row["id"] if "id" in row.keys() else None,
            )
            inserted += 1
        self.stdout.write(f"Ventas importadas: {inserted}")
        return sales_index

    def _import_sales_from_django_sql(self, conn, inventory_map, user):
        inserted = 0
        sales_index = self._new_sales_index()
        client_map = self._import_clients(conn, user)
        rows = conn.execute(
            """
            SELECT s.*, ii.product_id AS legacy_product_id
            FROM sales_sale s
            LEFT JOIN inventory_inventoryitem ii ON ii.id = s.product_id
            ORDER BY s.id ASC
            """
        ).fetchall()
        for row in rows:
            customer_name = self._clean_text(row["customer_name"]) or "Cliente sin nombre"
            customer_contact = self._normalize_contact(row["customer_contact"])
            client = client_map.get(row["client_id"])
            if not client and customer_name:
                client, created = Client.objects.get_or_create(
                    name=customer_name,
                    defaults={
                        "phone": customer_contact,
                        "notes": "Importado desde legacy",
                        "created_by": user,
                        "updated_by": user,
                    },
                )
                if not created and not (client.phone or "").strip() and customer_contact:
                    client.phone = customer_contact
                if client.created_by_id is None:
                    client.created_by = user
                    client.updated_by = user
                client.updated_by = user
                client.save(update_fields=["phone", "created_by", "updated_by", "updated_at"])

            product = inventory_map.get(self._clean_text(row["legacy_product_id"]))
            sale = Sale(
                client=client,
                product=product,
                sale_date=self._parse_date(row["sale_date"]) or timezone.localdate(),
                customer_name=customer_name,
                customer_contact=customer_contact,
                payment_method=self._map_payment_method(row["payment_method"]),
                sales_channel=self._map_sales_channel(row["sales_channel"]),
                amount_paid=self._to_decimal(row["amount_paid"]),
                extras=self._to_decimal(row["extras"]),
                sale_shipping_cost=self._to_decimal(row["sale_shipping_cost"]),
                cost_snapshot=self._to_decimal(row["cost_snapshot"]),
                notes=self._clean_text(row["notes"]) or "Importado desde legacy",
                created_by=user,
                updated_by=user,
            )
            sale.save()
            self._index_sale(
                sales_index=sales_index,
                sale=sale,
                legacy_sale_id=row["id"] if "id" in row.keys() else None,
            )
            inserted += 1
        self.stdout.write(f"Ventas importadas: {inserted}")
        return sales_index

    def _import_clients(self, conn, user):
        if not self._table_exists(conn, "clientes"):
            return {}
        rows = conn.execute("SELECT * FROM clientes ORDER BY id ASC").fetchall()
        client_map = {}
        for row in rows:
            name = self._clean_text(row["nombre"]) or "Cliente sin nombre"
            contact = self._normalize_contact(row["contacto"])
            client, created = Client.objects.get_or_create(
                name=name,
                defaults={
                    "phone": contact,
                    "notes": "Importado desde legacy",
                    "created_by": user,
                    "updated_by": user,
                },
            )
            if not created and not (client.phone or "").strip() and contact:
                client.phone = contact
            if client.created_by_id is None:
                client.created_by = user
                client.updated_by = user
            client.updated_by = user
            client.save(update_fields=["phone", "created_by", "updated_by", "updated_at"])
            client_map[row["id"]] = client
        self.stdout.write(f"Clientes importados: {len(client_map)}")
        return client_map

    def _import_finance(self, conn, inventory_map, sales_index, user):
        inserted = 0
        rows = conn.execute("SELECT * FROM finanzas ORDER BY id ASC").fetchall()
        for row in rows:
            raw_amount = self._to_decimal(row["monto"])
            entry_type = self._entry_type_from_signed_amount(
                raw_amount, fallback=self._map_entry_type(row["tipo"])
            )
            amount = abs(raw_amount)
            concept = self._map_concept(row["concepto"])
            notes = self._clean_text(row["notas"])
            product = self._find_product_from_notes(notes, inventory_map)
            entry_date = self._parse_date(row["fecha"]) or timezone.localdate()
            sale = self._resolve_sale_for_finance_entry(
                sales_index=sales_index,
                legacy_sale_id=row["sale_id"] if "sale_id" in row.keys() else None,
                product=product,
                entry_date=entry_date,
                amount=amount,
                concept=concept,
                entry_type=entry_type,
            )

            FinanceEntry.objects.create(
                entry_type=entry_type,
                concept=concept,
                amount=amount,
                account=self._map_account(row["metodo_pago"]),
                entry_date=entry_date,
                is_automatic=False,
                notes=notes,
                product=product,
                sale=sale,
                created_by=user,
                updated_by=user,
            )
            inserted += 1
        self.stdout.write(f"Movimientos financieros importados: {inserted}")

    def _import_finance_from_django_sql(self, conn, inventory_map, sales_index, user):
        inserted = 0
        rows = conn.execute(
            """
            SELECT f.*, ii.product_id AS legacy_product_id
            FROM finance_financeentry f
            LEFT JOIN inventory_inventoryitem ii ON ii.id = f.product_id
            ORDER BY f.id ASC
            """
        ).fetchall()
        for row in rows:
            raw_amount = self._to_decimal(row["amount"])
            entry_type = self._entry_type_from_signed_amount(
                raw_amount, fallback=self._map_entry_type(row["entry_type"])
            )
            amount = abs(raw_amount)
            concept = self._map_concept(row["concept"])
            notes = self._clean_text(row["notes"])
            product = inventory_map.get(self._clean_text(row["legacy_product_id"]))
            entry_date = self._parse_date(row["entry_date"]) or timezone.localdate()
            sale = self._resolve_sale_for_finance_entry(
                sales_index=sales_index,
                legacy_sale_id=row["sale_id"] if "sale_id" in row.keys() else None,
                product=product,
                entry_date=entry_date,
                amount=amount,
                concept=concept,
                entry_type=entry_type,
            )

            FinanceEntry.objects.create(
                entry_type=entry_type,
                concept=concept,
                amount=amount,
                account=self._map_account(row["account"]),
                entry_date=entry_date,
                is_automatic=False,
                notes=notes,
                product=product,
                sale=sale,
                created_by=user,
                updated_by=user,
            )
            inserted += 1
        self.stdout.write(f"Movimientos financieros importados: {inserted}")

    def _find_product_from_notes(self, notes, inventory_map):
        for product_id, item in inventory_map.items():
            if product_id in notes:
                return item
        return None

    @staticmethod
    def _new_sales_index():
        return {"by_legacy_id": {}, "by_product": {}, "all": []}

    def _index_sale(self, sales_index, sale, legacy_sale_id=None):
        if legacy_sale_id is not None:
            sales_index["by_legacy_id"][legacy_sale_id] = sale
        if sale.product_id:
            sales_index["by_product"].setdefault(sale.product_id, []).append(sale)
        sales_index["all"].append(sale)

    def _resolve_sale_for_finance_entry(
        self,
        sales_index,
        legacy_sale_id,
        product,
        entry_date,
        amount,
        concept,
        entry_type,
    ):
        if concept != FinanceEntry.CONCEPT_SALE or entry_type != FinanceEntry.TYPE_INCOME:
            return None

        if legacy_sale_id in sales_index["by_legacy_id"]:
            return sales_index["by_legacy_id"][legacy_sale_id]

        candidates = sales_index["by_product"].get(product.id, []) if product else []
        if not candidates:
            candidates = sales_index["all"]
        if not candidates:
            return None

        same_day_amount = [
            sale
            for sale in candidates
            if sale.sale_date == entry_date and abs((sale.amount_paid or Decimal("0.00")) - amount) <= Decimal("0.01")
        ]
        if same_day_amount:
            return same_day_amount[0]

        same_day = [sale for sale in candidates if sale.sale_date == entry_date]
        if same_day:
            return same_day[0]

        return min(candidates, key=lambda sale: abs((sale.sale_date - entry_date).days))

    def _rebuild_balances(self):
        AccountBalance.objects.all().delete()
        for account in [
            FinanceEntry.ACCOUNT_CASH,
            FinanceEntry.ACCOUNT_BBVA,
            FinanceEntry.ACCOUNT_CREDIT,
            FinanceEntry.ACCOUNT_AMEX,
        ]:
            recalculate_account_balance(account)
        self.stdout.write("Balances por cuenta recalculados.")

    @staticmethod
    def _clean_text(value):
        return str(value or "").strip()

    @staticmethod
    def _normalize_contact(value):
        contact = str(value or "").strip()
        if contact.lower() in {"0", "null", "none", "nan", "n/a", "-"}:
            return ""
        return contact

    @staticmethod
    def _parse_date(value):
        text = str(value or "").strip()
        if not text:
            return None
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
            try:
                return datetime.strptime(text, fmt).date()
            except ValueError:
                continue
        return None

    @staticmethod
    def _to_decimal(value, default=Decimal("0.00")):
        text = str(value or "").strip()
        if not text:
            return default
        cleaned = (
            text.replace("$", "")
            .replace(",", "")
            .replace(" ", "")
            .replace("\u202a", "")
            .replace("\u202c", "")
        )
        try:
            return Decimal(cleaned)
        except Exception:
            return default

    @staticmethod
    def _to_int(value):
        text = str(value or "").strip()
        if not text:
            return None
        try:
            return int(float(text))
        except Exception:
            return None

    @staticmethod
    def _map_inventory_status(value):
        normalized = str(value or "").strip().lower()
        mapping = {
            "disponible": InventoryItem.STATUS_AVAILABLE,
            "vendido": InventoryItem.STATUS_SOLD,
            "apartado": InventoryItem.STATUS_RESERVED,
            "on_layaway": InventoryItem.STATUS_RESERVED,
            "reserved": InventoryItem.STATUS_RESERVED,
            "available": InventoryItem.STATUS_AVAILABLE,
            "sold": InventoryItem.STATUS_SOLD,
        }
        return mapping.get(normalized, InventoryItem.STATUS_AVAILABLE)

    @staticmethod
    def _map_sales_channel(value):
        normalized = str(value or "").strip().lower()
        if "instagram" in normalized:
            return InventoryItem.CHANNEL_INSTAGRAM
        if "whatsapp" in normalized:
            return InventoryItem.CHANNEL_WHATSAPP
        if "marketplace" in normalized:
            return InventoryItem.CHANNEL_MARKETPLACE
        if "direct" in normalized:
            return InventoryItem.CHANNEL_DIRECT
        return InventoryItem.CHANNEL_OTHER

    @staticmethod
    def _map_payment_method(value):
        normalized = str(value or "").strip().lower()
        if "transfer" in normalized:
            return "transfer"
        if "tarjeta" in normalized or "credito" in normalized or "credit" in normalized:
            return "card"
        if "consigna" in normalized:
            return "consignment"
        if "msi" in normalized:
            return "msi"
        return "cash"

    @staticmethod
    def _map_account(value):
        normalized = str(value or "").strip().lower()
        if "nu" in normalized:
            return FinanceEntry.ACCOUNT_AMEX
        if "bbva" in normalized or "transfer" in normalized:
            return FinanceEntry.ACCOUNT_BBVA
        if "amex" in normalized:
            return FinanceEntry.ACCOUNT_AMEX
        if "credito" in normalized or "credit" in normalized or "tarjeta" in normalized:
            return FinanceEntry.ACCOUNT_CREDIT
        return FinanceEntry.ACCOUNT_CASH

    @staticmethod
    def _map_entry_type(value):
        normalized = str(value or "").strip().lower()
        if normalized in {"egreso", "expense"}:
            return FinanceEntry.TYPE_EXPENSE
        return FinanceEntry.TYPE_INCOME

    @staticmethod
    def _entry_type_from_signed_amount(amount, fallback):
        if amount < 0:
            return FinanceEntry.TYPE_EXPENSE
        if amount > 0:
            return FinanceEntry.TYPE_INCOME
        return fallback

    @staticmethod
    def _map_concept(value):
        normalized = str(value or "").strip().lower()
        if "abono" in normalized and "capital" in normalized:
            return FinanceEntry.CONCEPT_CAPITAL_PAYMENT
        if "compra" in normalized:
            return FinanceEntry.CONCEPT_PURCHASE
        if "transfer" in normalized:
            return FinanceEntry.CONCEPT_TRANSFER
        if "gasto" in normalized:
            return FinanceEntry.CONCEPT_EXPENSE
        return FinanceEntry.CONCEPT_SALE

    @staticmethod
    def _table_exists(conn, table_name):
        row = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            [table_name],
        ).fetchone()
        return row is not None

    @staticmethod
    def _table_has_rows(conn, table_name):
        row = conn.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()
        return bool(row and row[0] > 0)

    @staticmethod
    def _bootstrap_staging_tables(conn):
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS inventory_inventoryitem (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id TEXT,
                name TEXT,
                brand TEXT,
                model_name TEXT,
                year_label TEXT,
                condition_score REAL,
                price REAL,
                cost_price REAL,
                shipping_cost REAL,
                maintenance_cost REAL,
                purchase_date TEXT,
                sold_date TEXT,
                sold_at TEXT,
                days_to_sell INTEGER,
                status TEXT,
                sales_channel TEXT,
                notes TEXT,
                is_active INTEGER,
                is_deleted INTEGER,
                stock INTEGER,
                created_at TEXT,
                updated_at TEXT,
                created_by_id INTEGER,
                updated_by_id INTEGER
            );
            CREATE UNIQUE INDEX IF NOT EXISTS ix_stg_inventory_product_id
                ON inventory_inventoryitem(product_id);

            CREATE TABLE IF NOT EXISTS inventory_purchasecost (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id_id INTEGER,
                purchase_date TEXT,
                watch_cost REAL,
                shipping_cost REAL,
                maintenance_cost REAL,
                other_costs REAL,
                total_pagado REAL,
                payment_method TEXT,
                source_account TEXT,
                notes TEXT,
                created_at TEXT,
                updated_at TEXT
            );
            CREATE UNIQUE INDEX IF NOT EXISTS ix_stg_purchasecost_product
                ON inventory_purchasecost(product_id_id);

            CREATE TABLE IF NOT EXISTS clients_client (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                phone TEXT,
                email TEXT,
                instagram_handle TEXT,
                address TEXT,
                notes TEXT,
                is_active INTEGER,
                is_deleted INTEGER,
                created_at TEXT,
                updated_at TEXT,
                created_by_id INTEGER,
                updated_by_id INTEGER
            );

            CREATE TABLE IF NOT EXISTS sales_sale (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id INTEGER,
                product_id INTEGER,
                sale_date TEXT,
                customer_name TEXT,
                customer_contact TEXT,
                payment_method TEXT,
                sales_channel TEXT,
                total REAL,
                amount_paid REAL,
                extras REAL,
                sale_shipping_cost REAL,
                cost_snapshot REAL,
                gross_profit REAL,
                profit_percentage REAL,
                notes TEXT,
                is_deleted INTEGER,
                created_at TEXT,
                updated_at TEXT,
                created_by_id INTEGER,
                updated_by_id INTEGER
            );

            CREATE TABLE IF NOT EXISTS finance_financeentry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entry_type TEXT,
                concept TEXT,
                amount REAL,
                account TEXT,
                entry_date TEXT,
                is_automatic INTEGER,
                notes TEXT,
                product_id INTEGER,
                sale_id INTEGER,
                is_deleted INTEGER,
                created_at TEXT,
                updated_at TEXT,
                created_by_id INTEGER,
                updated_by_id INTEGER
            );

            CREATE TABLE IF NOT EXISTS finance_accountbalance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account TEXT,
                balance REAL,
                updated_at TEXT
            );
            CREATE UNIQUE INDEX IF NOT EXISTS ix_stg_balance_account
                ON finance_accountbalance(account);
            """
        )
