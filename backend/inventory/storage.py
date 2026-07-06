from pathlib import PurePosixPath
from uuid import uuid4

import cloudinary
import cloudinary.api
import cloudinary.uploader
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class CloudinaryImageStorage(Storage):
    """Django storage backend backed by Cloudinary's official Python SDK."""

    def _open(self, name, mode="rb"):
        raise NotImplementedError("Las imágenes de Cloudinary se leen mediante su URL CDN.")

    def _save(self, name, content):
        path = PurePosixPath(name)
        folder_parts = ["alternative-time", "catalog", *path.parts[:-1]]
        result = cloudinary.uploader.upload(
            content,
            folder="/".join(folder_parts),
            public_id=f"{path.stem}-{uuid4().hex[:12]}",
            resource_type="image",
            type="upload",
            unique_filename=False,
            overwrite=False,
        )
        return result["public_id"]

    def delete(self, name):
        if name:
            cloudinary.uploader.destroy(name, resource_type="image", invalidate=True)

    def exists(self, name):
        # Cloudinary adds a unique suffix, so local-name collisions are harmless.
        return False

    def url(self, name):
        return cloudinary.CloudinaryImage(name).build_url(
            secure=True,
            fetch_format="auto",
            quality="auto",
        )

    def size(self, name):
        return cloudinary.api.resource(name, resource_type="image")["bytes"]
