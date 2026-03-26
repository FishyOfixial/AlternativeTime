from django.core.management.base import BaseCommand

from inventory.models import InventoryItem


class Command(BaseCommand):
    help = "Resincroniza la etiqueta de antiguedad de los relojes disponibles."

    def handle(self, *args, **options):
        updated = 0
        for item in InventoryItem.objects.exclude(status=InventoryItem.STATUS_SOLD):
            current_tag = item.tag
            next_tag = item.etiqueta_antiguedad
            if current_tag != next_tag:
                item.tag = next_tag
                item.save(update_fields=["tag", "updated_at"])
                updated += 1
        self.stdout.write(self.style.SUCCESS(f"Etiquetas actualizadas: {updated}"))
