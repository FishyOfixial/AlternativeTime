from django.core.cache import cache
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import InventoryItem, InventoryItemImage


PUBLIC_CATALOG_VERSION_KEY = "public_catalog:version"


def invalidate_public_catalog_cache_version():
    if cache.add(PUBLIC_CATALOG_VERSION_KEY, 1, None):
        return
    try:
        cache.incr(PUBLIC_CATALOG_VERSION_KEY)
    except ValueError:
        cache.set(PUBLIC_CATALOG_VERSION_KEY, 1, None)


@receiver(post_save, sender=InventoryItem)
@receiver(post_delete, sender=InventoryItem)
@receiver(post_save, sender=InventoryItemImage)
@receiver(post_delete, sender=InventoryItemImage)
def invalidate_public_catalog_cache(**kwargs):
    invalidate_public_catalog_cache_version()
