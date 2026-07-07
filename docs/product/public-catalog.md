# Catalogo Publico

## Objetivo

El catalogo permite que cualquier cliente consulte los relojes publicados sin
iniciar sesion y sin acceso al POS. Reutiliza `InventoryItem` como unica fuente
de precio, descripcion, estado y existencia.

## Rutas

| Capa | Ruta | Acceso |
| --- | --- | --- |
| Frontend | `/catalog` | Publico |
| Frontend | `/catalog/:id` | Publico |
| API | `GET /api/catalog/` | Publico, solo lectura |
| API | `GET /api/catalog/:id/` | Publico, solo lectura |
| API | `POST /api/inventory/:id/primary-image/` | JWT requerido |
| API | `POST /api/inventory/:id/images/` | JWT requerido |

La raiz `/` redirige al catalogo. El acceso interno continua en `/login`.

## Reglas de publicacion

Una pieza aparece unicamente cuando:

- `is_published=True`
- `is_active=True`
- no tiene estado `sold`
- no esta eliminada logicamente

Una pieza reservada puede seguir apareciendo como `Apartado`. Al registrar una
venta, el modelo establece existencia cero e inactividad y el endpoint publico
la excluye automaticamente, aunque conserve `is_published=True`.

El serializer publico no expone costos, proveedor, notas, usuario creador,
fechas internas ni acciones de escritura.

## Fotografias

La ficha interna de inventario acepta una galeria de hasta 10 fotografias por
reloj. La primera imagen seleccionada funciona como foto principal en tarjetas y
detalle:

- formatos: JPG, PNG o WebP
- tamano maximo: 8 MB por imagen
- maximo: 10 imagenes por reloj
- subida disponible solo para usuarios autenticados
- reemplazar la galeria elimina los archivos anteriores del storage

El campo historico `primary_image` se conserva como fallback para imagenes ya
existentes, pero el catalogo prioriza la nueva galeria `catalog_images`.

Con `CLOUDINARY_URL`, Django utiliza el backend
`inventory.storage.CloudinaryImageStorage`. Las imagenes se guardan bajo
`alternative-time/catalog/` y se entregan por HTTPS con formato y calidad
automaticos. Sin la variable, se usa el filesystem local en `backend/media`.

```env
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

La URL contiene un secreto y solo debe guardarse en `.env` local y en las
variables protegidas del servicio backend.

## Contacto comercial

El frontend usa:

```env
VITE_WHATSAPP_URL=https://wa.me/521XXXXXXXXXX
VITE_INSTAGRAM_URL=https://www.instagram.com/alternative_time_co/
```

El detalle agrega al enlace de WhatsApp un mensaje con el nombre de la pieza y
muestra el CTA `Adquirir por WhatsApp`. Ambos enlaces abren en una pestana o
aplicacion externa.

## Filtros y ordenamiento

El catalogo permite a los clientes buscar y filtrar por marca, estilo/anio,
rango de precio y condicion minima. Tambien permite ordenar por recientes,
menor precio, mayor precio, marca o mejor condicion. El endpoint publico acepta
estos query params para futuras URLs compartibles:

- `search`
- `brand`
- `year_label`
- `min_price`
- `max_price`
- `condition_min`
- `ordering`: `newest`, `price_asc`, `price_desc`, `brand`, `condition_desc`

## Operacion

Para publicar una pieza:

1. Iniciar sesion en `/login`.
2. Abrir `Inventario`.
3. Crear o editar el reloj.
4. Capturar descripcion y precio.
5. Seleccionar de 1 a 10 fotografias para la galeria.
6. Activar `Publicar en el catalogo`.
7. Guardar y revisar `/catalog`.

Para retirarla sin venderla, desactivar `Publicar en el catalogo`. Una venta la
retira automaticamente.

## Produccion en Render

Configurar en `alternative-time-api`:

- `CLOUDINARY_URL`

Configurar durante el build de `alternative-time-web`:

- `VITE_WHATSAPP_URL`
- `VITE_INSTAGRAM_URL`

No se requiere disco persistente para media. PostgreSQL solo conserva el
identificador publico de cada imagen.
