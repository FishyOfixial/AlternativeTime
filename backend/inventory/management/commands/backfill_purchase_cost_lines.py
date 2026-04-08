from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction

from finance.models import FinanceEntry
from finance.services import recalculate_account_balance, sync_purchase_cost_line_finance_entry
from inventory.models import PurchaseCost, PurchaseCostLine


class Command(BaseCommand):
    help = "Migra costos legacy PurchaseCost a lineas PurchaseCostLine idempotentes."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Muestra lo que cambiaria sin escribir en la base de datos.",
        )
        parser.add_argument(
            "--sync-existing",
            action="store_true",
            help="Re-sincroniza movimientos financieros de lineas existentes.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        sync_existing = options["sync_existing"]

        created_lines = 0
        synced_lines = 0
        disabled_entries = 0
        skipped_lines = 0

        if PurchaseCostLine._meta.db_table not in connection.introspection.table_names():
            raise CommandError(
                "La tabla de lineas de costo no existe. Ejecuta primero: python manage.py migrate inventory"
            )

        for purchase_cost in PurchaseCost.objects.select_related("product").order_by("id"):
            product = purchase_cost.product
            disabled_entries += self._disable_legacy_purchase_entries(product, dry_run=dry_run)

            for field_name, cost_type, label in self._cost_fields():
                amount = Decimal(str(getattr(purchase_cost, field_name) or "0.00"))
                if amount <= 0:
                    continue

                existing_line = self._find_existing_line(
                    product=product,
                    cost_type=cost_type,
                    amount=amount,
                    account=purchase_cost.source_account or FinanceEntry.ACCOUNT_CASH,
                    cost_date=purchase_cost.purchase_date,
                )

                if existing_line is not None:
                    skipped_lines += 1
                    if sync_existing:
                        synced_lines += self._sync_line(existing_line, dry_run=dry_run)
                    continue

                created_lines += 1
                if dry_run:
                    self.stdout.write(
                        f"Crearia linea {label} para {product.product_id}: "
                        f"{amount} / {purchase_cost.source_account}"
                    )
                    continue

                cost_line = PurchaseCostLine.objects.create(
                    product=product,
                    cost_type=cost_type,
                    amount=amount,
                    account=purchase_cost.source_account or FinanceEntry.ACCOUNT_CASH,
                    payment_method=purchase_cost.payment_method or "cash",
                    cost_date=purchase_cost.purchase_date,
                    notes=purchase_cost.notes or "",
                    created_by=product.created_by,
                    updated_by=product.updated_by,
                )
                sync_purchase_cost_line_finance_entry(cost_line)

        if dry_run:
            transaction.set_rollback(True)
        else:
            for account, _label in FinanceEntry.ACCOUNT_CHOICES:
                recalculate_account_balance(account)

        self.stdout.write(
            self.style.SUCCESS(
                "Backfill de costos terminado "
                f"(dry_run={dry_run}): "
                f"lineas_creadas={created_lines}, "
                f"lineas_existentes={skipped_lines}, "
                f"lineas_sincronizadas={synced_lines}, "
                f"movimientos_legacy_desactivados={disabled_entries}"
            )
        )

    @staticmethod
    def _cost_fields():
        return [
            ("watch_cost", PurchaseCostLine.TYPE_WATCH, "reloj"),
            ("shipping_cost", PurchaseCostLine.TYPE_SHIPPING, "envio"),
            ("maintenance_cost", PurchaseCostLine.TYPE_MAINTENANCE, "mantenimiento"),
            ("other_costs", PurchaseCostLine.TYPE_OTHER, "otro"),
        ]

    def _disable_legacy_purchase_entries(self, product, dry_run=False):
        queryset = FinanceEntry.all_objects.filter(
            product=product,
            concept=FinanceEntry.CONCEPT_PURCHASE,
            is_automatic=True,
            is_deleted=False,
            purchase_cost_line__isnull=True,
        )
        count = queryset.count()
        if dry_run or count == 0:
            return count
        queryset.update(is_deleted=True)
        return count

    @staticmethod
    def _find_existing_line(*, product, cost_type, amount, account, cost_date):
        queryset = PurchaseCostLine.all_objects.filter(
            product=product,
            cost_type=cost_type,
            is_deleted=False,
        ).order_by("id")

        exact_match = queryset.filter(
            amount=amount,
            account=account,
            cost_date=cost_date,
        ).first()
        if exact_match is not None:
            return exact_match

        return queryset.first()

    @staticmethod
    def _sync_line(cost_line, dry_run=False):
        if dry_run:
            return 1
        sync_purchase_cost_line_finance_entry(cost_line)
        return 1
