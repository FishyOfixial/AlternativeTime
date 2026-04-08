from collections import defaultdict

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction

from finance.models import FinanceEntry
from finance.services import recalculate_account_balance
from inventory.models import PurchaseCostLine


class Command(BaseCommand):
    help = "Audita y limpia duplicados de lineas de costo y movimientos de compra legacy."

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Aplica la limpieza. Sin este flag solo muestra lo que cambiaria.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        apply_changes = options["apply"]

        if PurchaseCostLine._meta.db_table not in connection.introspection.table_names():
            raise CommandError(
                "La tabla de lineas de costo no existe. Ejecuta primero: python manage.py migrate inventory"
            )

        duplicate_lines = self._find_duplicate_lines()
        legacy_entries = self._find_legacy_purchase_entries()

        for line in duplicate_lines:
            product_code = line.product.product_id or line.product.sku or line.product_id
            self.stdout.write(
                f"{'Eliminaria' if not apply_changes else 'Eliminando'} linea duplicada "
                f"#{line.id} ({line.cost_type}) para {product_code}: {line.amount} / {line.account}"
            )
            if apply_changes:
                self._soft_delete_line_and_entry(line)

        for entry in legacy_entries:
            product_code = entry.product.product_id if entry.product else entry.product_id
            self.stdout.write(
                f"{'Desactivaria' if not apply_changes else 'Desactivando'} movimiento legacy "
                f"#{entry.id} para {product_code}: {entry.amount} / {entry.account}"
            )
            if apply_changes:
                entry.is_deleted = True
                entry.save(update_fields=["is_deleted", "updated_at"])

        if apply_changes:
            for account, _label in FinanceEntry.ACCOUNT_CHOICES:
                recalculate_account_balance(account)
        else:
            transaction.set_rollback(True)

        self.stdout.write(
            self.style.SUCCESS(
                "Auditoria de duplicados terminada "
                f"(apply={apply_changes}): "
                f"lineas_duplicadas={len(duplicate_lines)}, "
                f"movimientos_legacy={len(legacy_entries)}"
            )
        )

    def _find_duplicate_lines(self):
        duplicate_lines = []
        lines_by_product = defaultdict(list)
        active_lines = (
            PurchaseCostLine.objects.select_related("product", "finance_entry")
            .filter(is_deleted=False)
            .order_by("product_id", "cost_type", "created_at", "id")
        )
        for line in active_lines:
            lines_by_product[line.product_id].append(line)

        for product_lines in lines_by_product.values():
            watch_lines = [line for line in product_lines if line.cost_type == PurchaseCostLine.TYPE_WATCH]
            duplicate_lines.extend(watch_lines[1:])

            exact_groups = defaultdict(list)
            for line in product_lines:
                if line.cost_type == PurchaseCostLine.TYPE_WATCH:
                    continue
                key = (
                    line.cost_type,
                    line.amount,
                    line.account,
                    line.payment_method,
                    line.cost_date,
                    line.notes or "",
                )
                exact_groups[key].append(line)

            for group_lines in exact_groups.values():
                duplicate_lines.extend(group_lines[1:])

        return duplicate_lines

    @staticmethod
    def _find_legacy_purchase_entries():
        return list(
            FinanceEntry.objects.select_related("product")
            .filter(
                concept=FinanceEntry.CONCEPT_PURCHASE,
                is_automatic=True,
                is_deleted=False,
                purchase_cost_line__isnull=True,
                product__purchase_cost_lines__is_deleted=False,
            )
            .distinct()
            .order_by("product_id", "entry_date", "id")
        )

    @staticmethod
    def _soft_delete_line_and_entry(line):
        finance_entry = line.finance_entry
        line.is_deleted = True
        line.save(update_fields=["is_deleted", "updated_at"])

        if finance_entry is not None:
            finance_entry.is_deleted = True
            finance_entry.save(update_fields=["is_deleted", "updated_at"])
