from django.core.cache import cache
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import InventoryItem, InventoryItemImage


def clear_public_catalog_cache():
    # The public catalog is small and read-heavy. Clearing the configured cache is
    # simpler and safer than trying to target Django's per-view cache keys.
    cache.clear()


@receiver(post_save, sender=InventoryItem)
@receiver(post_delete, sender=InventoryItem)
@receiver(post_save, sender=InventoryItemImage)
@receiver(post_delete, sender=InventoryItemImage)
def invalidate_public_catalog_cache(**kwargs):
    clear_public_catalog_cache()
