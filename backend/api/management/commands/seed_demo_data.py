from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from clients.models import Client
from finance.models import FinanceEntry
from finance.services import recalculate_account_balance, sync_purchase_cost_line_finance_entry
from inventory.models import InventoryItem, PurchaseCost, PurchaseCostLine
from layaways.models import Layaway, LayawayPayment
from sales.models import Sale


SEED_MARKER = "[seed_demo_data]"


class Command(BaseCommand):
    help = "Creates idempotent demo data for staging environments."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Run even when APP_ENV is not staging.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if settings.APP_ENV != "staging" and not options["force"]:
            self.stdout.write(
                self.style.WARNING(
                    "Skipping demo seed because APP_ENV is not 'staging'. Use --force to run anyway."
                )
            )
            return

        user = self._seed_user()
        clients = self._seed_clients(user)
        items = self._seed_inventory(user)
        self._seed_sale(user, clients["ricardo"], items["tissot"])
        self._seed_layaway(user, clients["diana"], items["seiko"])
        self._recalculate_balances()

        self.stdout.write(
            self.style.SUCCESS(
                "Demo data ready: user 'prueba' / password 'demo', "
                f"{Client.objects.count()} clients, "
                f"{InventoryItem.objects.count()} watches, "
                f"{Sale.objects.count()} sales, "
                f"{Layaway.objects.count()} layaways."
            )
        )

    def _seed_user(self):
        User = get_user_model()
        user, _ = User.objects.update_or_create(
            username="prueba",
            defaults={
                "email": "prueba@demo.local",
                "first_name": "Usuario",
                "last_name": "Demo",
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            },
        )
        user.set_password("demo")
        user.save()
        return user

    def _seed_clients(self, user):
        clients = {}
        client_specs = [
            {
                "key": "ricardo",
                "name": "Ricardo Torres",
                "phone": "33 1155 8630",
                "email": "ricardo.demo@example.com",
                "instagram_handle": "@ricardo.demo",
                "address": "Av. Mexico 120, Guadalajara",
                "notes": f"{SEED_MARKER} Cliente recurrente",
            },
            {
                "key": "diana",
                "name": "Diana Flores",
                "phone": "33 2088 1144",
                "email": "diana.demo@example.com",
                "instagram_handle": "@dianaf.demo",
                "address": "Providencia, Guadalajara",
                "notes": f"{SEED_MARKER} Seguimiento de apartado",
            },
            {
                "key": "hector",
                "name": "Hector Ruiz",
                "phone": "33 4400 9911",
                "email": "hector.demo@example.com",
                "instagram_handle": "@hector.demo",
                "address": "Zapopan Centro",
                "notes": f"{SEED_MARKER} Prospecto de marketplace",
            },
        ]

        for spec in client_specs:
            client, _ = Client.all_objects.update_or_create(
                email=spec["email"],
                defaults={
                    "name": spec["name"],
                    "phone": spec["phone"],
                    "instagram_handle": spec["instagram_handle"],
                    "address": spec["address"],
                    "notes": spec["notes"],
                    "is_active": True,
                    "is_deleted": False,
                    "created_by": user,
                    "updated_by": user,
                },
            )
            clients[spec["key"]] = client

        return clients

    def _seed_inventory(self, user):
        today = timezone.localdate()
        return {
            "omega": self._upsert_inventory_item(
                user=user,
                product_id="DEV-101",
                brand="Omega",
                model_name="Seamaster",
                year_label="2018",
                condition_score=Decimal("9.0"),
                provider="Coleccionista local",
                description="Pieza disponible para pruebas de inventario.",
                notes=f"{SEED_MARKER} Disponible",
                price=Decimal("25500.00"),
                purchase_date=today - timedelta(days=18),
                status=InventoryItem.STATUS_AVAILABLE,
                sales_channel=InventoryItem.CHANNEL_INSTAGRAM,
                payment_method="transfer",
                purchase_cost_data={
                    "watch_cost": Decimal("18000.00"),
                    "shipping_cost": Decimal("400.00"),
                    "maintenance_cost": Decimal("600.00"),
                    "other_costs": Decimal("0.00"),
                    "payment_method": "transfer",
                    "source_account": FinanceEntry.ACCOUNT_BBVA,
                    "notes": f"{SEED_MARKER} Compra Omega",
                },
            ),
            "seiko": self._upsert_inventory_item(
                user=user,
                product_id="DEV-102",
                brand="Seiko",
                model_name="Presage Cocktail",
                year_label="2021",
                condition_score=Decimal("8.5"),
                provider="Importadora demo",
                description="Pieza usada para flujo de apartados.",
                notes=f"{SEED_MARKER} Apartado activo",
                price=Decimal("9800.00"),
                purchase_date=today - timedelta(days=22),
                status=InventoryItem.STATUS_AVAILABLE,
                sales_channel=InventoryItem.CHANNEL_WHATSAPP,
                payment_method="cash",
                purchase_cost_data={
                    "watch_cost": Decimal("6200.00"),
                    "shipping_cost": Decimal("250.00"),
                    "maintenance_cost": Decimal("150.00"),
                    "other_costs": Decimal("0.00"),
                    "payment_method": "cash",
                    "source_account": FinanceEntry.ACCOUNT_CASH,
                    "notes": f"{SEED_MARKER} Compra Seiko",
                },
            ),
            "tissot": self._upsert_inventory_item(
                user=user,
                product_id="DEV-103",
                brand="Tissot",
                model_name="PRX Powermatic 80",
                year_label="2022",
                condition_score=Decimal("9.3"),
                provider="Subasta demo",
                description="Pieza de ejemplo para ventas.",
                notes=f"{SEED_MARKER} Venta realizada",
                price=Decimal("12900.00"),
                purchase_date=today - timedelta(days=31),
                status=InventoryItem.STATUS_AVAILABLE,
                sales_channel=InventoryItem.CHANNEL_DIRECT,
                payment_method="card",
                purchase_cost_data={
                    "watch_cost": Decimal("8900.00"),
                    "shipping_cost": Decimal("0.00"),
                    "maintenance_cost": Decimal("0.00"),
                    "other_costs": Decimal("0.00"),
                    "payment_method": "card",
                    "source_account": FinanceEntry.ACCOUNT_CREDIT,
                    "notes": f"{SEED_MARKER} Compra Tissot",
                },
            ),
            "casio": self._upsert_inventory_item(
                user=user,
                product_id="DEV-104",
                brand="Casio",
                model_name="G-Shock GA-2100",
                year_label="2020",
                condition_score=Decimal("8.2"),
                provider="Compra rapida",
                description="Pieza antigua para notificaciones de inventario.",
                notes=f"{SEED_MARKER} Inventario antiguo",
                price=Decimal("5400.00"),
                purchase_date=today - timedelta(days=85),
                status=InventoryItem.STATUS_AVAILABLE,
                sales_channel=InventoryItem.CHANNEL_MARKETPLACE,
                payment_method="cash",
                purchase_cost_data={
                    "watch_cost": Decimal("3100.00"),
                    "shipping_cost": Decimal("120.00"),
                    "maintenance_cost": Decimal("80.00"),
                    "other_costs": Decimal("0.00"),
                    "payment_method": "cash",
                    "source_account": FinanceEntry.ACCOUNT_CASH,
                    "notes": f"{SEED_MARKER} Compra Casio",
                },
            ),
        }

    def _upsert_inventory_item(
        self,
        *,
        user,
        product_id,
        brand,
        model_name,
        year_label,
        condition_score,
        provider,
        description,
        notes,
        price,
        purchase_date,
        status,
        sales_channel,
        payment_method,
        purchase_cost_data,
    ):
        item, _ = InventoryItem.all_objects.update_or_create(
            product_id=product_id,
            defaults={
                "sku": product_id,
                "name": f"{brand} {model_name}",
                "brand": brand,
                "model_name": model_name,
                "year_label": year_label,
                "condition_score": condition_score,
                "provider": provider,
                "description": description,
                "notes": notes,
                "price": price,
                "purchase_date": purchase_date,
                "status": status,
                "sales_channel": sales_channel,
                "payment_method": payment_method,
                "created_by": user,
                "updated_by": user,
                "is_deleted": False,
            },
        )

        purchase_cost, _ = PurchaseCost.objects.update_or_create(
            product=item,
            defaults={
                "purchase_date": purchase_date,
                "watch_cost": purchase_cost_data["watch_cost"],
                "shipping_cost": purchase_cost_data["shipping_cost"],
                "maintenance_cost": purchase_cost_data["maintenance_cost"],
                "other_costs": purchase_cost_data["other_costs"],
                "payment_method": purchase_cost_data["payment_method"],
                "source_account": purchase_cost_data["source_account"],
                "notes": purchase_cost_data["notes"],
            },
        )

        FinanceEntry.all_objects.filter(product=item, concept=FinanceEntry.CONCEPT_PURCHASE).update(is_deleted=True)
        for field_name, cost_type in [
            ("watch_cost", PurchaseCostLine.TYPE_WATCH),
            ("shipping_cost", PurchaseCostLine.TYPE_SHIPPING),
            ("maintenance_cost", PurchaseCostLine.TYPE_MAINTENANCE),
            ("other_costs", PurchaseCostLine.TYPE_OTHER),
        ]:
            amount = purchase_cost_data[field_name]
            if amount <= 0:
                continue
            cost_line, _ = PurchaseCostLine.all_objects.update_or_create(
                product=item,
                cost_type=cost_type,
                defaults={
                    "amount": amount,
                    "account": purchase_cost_data["source_account"],
                    "payment_method": purchase_cost_data["payment_method"],
                    "cost_date": purchase_date,
                    "notes": purchase_cost_data["notes"],
                    "created_by": user,
                    "updated_by": user,
                    "is_deleted": False,
                },
            )
            sync_purchase_cost_line_finance_entry(cost_line)

        return item

    def _seed_sale(self, user, client, item):
        sale_date = timezone.localdate() - timedelta(days=7)
        sale, _ = Sale.all_objects.update_or_create(
            product=item,
            defaults={
                "client": client,
                "sale_date": sale_date,
                "customer_name": client.name,
                "customer_contact": client.phone,
                "payment_method": "card",
                "sales_channel": InventoryItem.CHANNEL_DIRECT,
                "amount_paid": Decimal("12500.00"),
                "extras": Decimal("300.00"),
                "sale_shipping_cost": Decimal("100.00"),
                "cost_snapshot": item.total_purchase_cost,
                "notes": f"{SEED_MARKER} Venta demo",
                "created_by": user,
                "updated_by": user,
                "is_deleted": False,
            },
        )

        item.status = InventoryItem.STATUS_SOLD
        item.sold_date = sale.sale_date
        item.sold_at = timezone.now()
        item.days_to_sell = max((sale.sale_date - item.purchase_date).days, 0)
        item.updated_by = user
        item.save()

        FinanceEntry.all_objects.update_or_create(
            sale=sale,
            concept=FinanceEntry.CONCEPT_SALE,
            defaults={
                "entry_type": FinanceEntry.TYPE_INCOME,
                "amount": sale.amount_paid,
                "account": FinanceEntry.ACCOUNT_CREDIT,
                "entry_date": sale.sale_date,
                "product": item,
                "notes": sale.notes,
                "is_automatic": True,
                "created_by": user,
                "updated_by": user,
                "is_deleted": False,
            },
        )

    def _seed_layaway(self, user, client, item):
        start_date = timezone.localdate() - timedelta(days=14)
        due_date = timezone.localdate() - timedelta(days=2)

        layaway, _ = Layaway.all_objects.update_or_create(
            product=item,
            defaults={
                "client": client,
                "customer_name": client.name,
                "customer_contact": client.phone,
                "agreed_price": Decimal("9500.00"),
                "start_date": start_date,
                "due_date": due_date,
                "status": Layaway.STATUS_ACTIVE,
                "notes": f"{SEED_MARKER} Apartado demo",
                "created_by": user,
                "updated_by": user,
                "is_deleted": False,
            },
        )

        item.status = InventoryItem.STATUS_RESERVED
        item.updated_by = user
        item.save()

        payment, _ = LayawayPayment.all_objects.update_or_create(
            layaway=layaway,
            notes=f"{SEED_MARKER} Anticipo demo",
            defaults={
                "payment_date": start_date + timedelta(days=1),
                "amount": Decimal("2500.00"),
                "payment_method": "transfer",
                "account": FinanceEntry.ACCOUNT_BBVA,
                "created_by": user,
                "updated_by": user,
                "is_deleted": False,
            },
        )

        layaway.updated_by = user
        layaway.save()

        FinanceEntry.all_objects.update_or_create(
            product=item,
            concept=FinanceEntry.CONCEPT_LAYAWAY_PAYMENT,
            notes=payment.notes,
            defaults={
                "entry_type": FinanceEntry.TYPE_INCOME,
                "amount": payment.amount,
                "account": payment.account,
                "entry_date": payment.payment_date,
                "is_automatic": True,
                "created_by": user,
                "updated_by": user,
                "is_deleted": False,
            },
        )

    def _recalculate_balances(self):
        for account, _label in FinanceEntry.ACCOUNT_CHOICES:
            recalculate_account_balance(account)
