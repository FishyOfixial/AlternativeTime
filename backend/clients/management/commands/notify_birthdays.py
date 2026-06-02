from datetime import date

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from clients.services import send_birthday_notifications


class Command(BaseCommand):
    help = "Envia correos a los dueños con clientes que cumplen años hoy."

    def add_arguments(self, parser):
        parser.add_argument(
            "--date",
            dest="notification_date",
            help="Fecha a evaluar en formato YYYY-MM-DD. Por defecto usa la fecha local.",
        )

    def handle(self, *args, **options):
        notification_date = self._get_notification_date(options.get("notification_date"))
        result = send_birthday_notifications(today=notification_date)

        self.stdout.write(
            "Cumpleaños encontrados: "
            f"{result.birthdays_found}. Correos enviados: {result.emails_sent}."
        )
        if result.errors:
            self.stdout.write(
                self.style.WARNING(
                    f"Errores de envio registrados: {len(result.errors)}. Revisa los logs."
                )
            )

    def _get_notification_date(self, raw_date):
        if not raw_date:
            return timezone.localdate()
        try:
            return date.fromisoformat(raw_date)
        except ValueError as exc:
            raise CommandError("La fecha debe usar el formato YYYY-MM-DD.") from exc
