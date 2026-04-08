from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction

from finance.models import FinanceEntry
from inventory.models import PurchaseCostLine


class Command(BaseCommand):
    help = "Enlaza lineas de costo importadas con movimientos de compra existentes cuando hay match unico."

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Aplica los enlaces. Sin este flag solo muestra lo que cambiaria.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        apply_changes = options["apply"]

        if PurchaseCostLine._meta.db_table not in connection.introspection.table_names():
            raise CommandError(
                "La tabla de lineas de costo no existe. Ejecuta primero: python manage.py migrate inventory"
            )

        linked_count = 0
        ambiguous_count = 0
        unmatched_count = 0

        cost_lines = (
            PurchaseCostLine.objects.select_related("product", "finance_entry")
            .filter(is_deleted=False, finance_entry__isnull=True, amount__gt=0)
            .order_by("product__product_id", "cost_date", "id")
        )

        for cost_line in cost_lines:
            match_result, candidates = self._find_unique_match(cost_line)
            product_code = cost_line.product.product_id or cost_line.product.sku or cost_line.product_id

            if match_result is None and candidates:
                ambiguous_count += 1
                candidate_ids = ", ".join(f"#{candidate.id}" for candidate in candidates)
                self.stdout.write(
                    f"Ambigua linea #{cost_line.id} {product_code}: "
                    f"{cost_line.amount} / {cost_line.account} / {cost_line.cost_date} "
                    f"(candidatos: {candidate_ids})"
                )
                continue

            if match_result is None:
                unmatched_count += 1
                self.stdout.write(
                    f"Sin match linea #{cost_line.id} {product_code}: "
                    f"{cost_line.amount} / {cost_line.account} / {cost_line.cost_date}"
                )
                continue

            linked_count += 1
            self.stdout.write(
                f"{'Enlazaria' if not apply_changes else 'Enlazando'} linea #{cost_line.id} {product_code} "
                f"con movimiento #{match_result.id}: "
                f"{cost_line.amount} / {cost_line.account} / {cost_line.cost_date}"
            )
            if apply_changes:
                cost_line.finance_entry = match_result
                cost_line.save(update_fields=["finance_entry", "updated_at"])
                if match_result.product_id is None:
                    match_result.product = cost_line.product
                    match_result.save(update_fields=["product", "updated_at"])

        if not apply_changes:
            transaction.set_rollback(True)

        self.stdout.write(
            self.style.SUCCESS(
                "Enlace de costos terminado "
                f"(apply={apply_changes}): "
                f"lineas_enlazadas={linked_count}, "
                f"lineas_ambiguas={ambiguous_count}, "
                f"lineas_sin_match={unmatched_count}"
            )
        )

    def _find_unique_match(self, cost_line):
        candidates = list(
            FinanceEntry.objects.filter(
                is_deleted=False,
                concept=FinanceEntry.CONCEPT_PURCHASE,
                entry_type=FinanceEntry.TYPE_EXPENSE,
                amount=cost_line.amount,
                account=cost_line.account,
                entry_date=cost_line.cost_date,
                purchase_cost_line__isnull=True,
            ).order_by("id")
        )

        if not candidates:
            return None, []

        product_matches = [candidate for candidate in candidates if candidate.product_id == cost_line.product_id]
        if len(product_matches) == 1:
            return product_matches[0], product_matches
        if len(product_matches) > 1:
            return None, product_matches

        product_code = cost_line.product.product_id or cost_line.product.sku or ""
        if product_code:
            note_matches = [
                candidate
                for candidate in candidates
                if candidate.product_id is None and product_code.lower() in (candidate.notes or "").lower()
            ]
            if len(note_matches) == 1:
                return note_matches[0], note_matches
            if len(note_matches) > 1:
                return None, note_matches

        return None, candidates
