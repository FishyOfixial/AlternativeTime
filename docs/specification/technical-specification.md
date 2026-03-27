# ATCoPOS — Especificación técnica de módulos y modelos de base de datos

**Alternative Time Co. · Sistema Punto de Venta**
Stack: Django 5 · Django REST Framework · React 18 · Tailwind CSS · PostgreSQL 15
Versión: 1.0 · Marzo 2026

---

## Índice

1. [Convenciones generales](#1-convenciones-generales)
2. [Módulo de Inventario](#2-módulo-de-inventario)
3. [Módulo de Costos de Compra](#3-módulo-de-costos-de-compra)
4. [Módulo de Ventas](#4-módulo-de-ventas)
5. [Módulo de Pagos y Apartados](#5-módulo-de-pagos-y-apartados)
6. [Módulo de Clientes](#6-módulo-de-clientes)
7. [Módulo de Finanzas](#7-módulo-de-finanzas)
8. [Módulo de Dashboard](#8-módulo-de-dashboard)
9. [Módulo de Reportes](#9-módulo-de-reportes)
10. [Módulo de Usuarios y Autenticación](#10-módulo-de-usuarios-y-autenticación)
11. [Automatizaciones del sistema](#11-automatizaciones-del-sistema)
12. [Diagrama de relaciones (ERD resumen)](#12-diagrama-de-relaciones-erd-resumen)
13. [Enumeraciones globales](#13-enumeraciones-globales)
14. [Reglas de validación globales](#14-reglas-de-validación-globales)

---

## 1. Convenciones generales

### Nomenclatura de campos
- Todos los campos de base de datos usan `snake_case`.
- Los IDs de productos siguen el patrón `[PREFIX]-[NNN]` donde PREFIX son 3 letras de la marca y NNN es un número secuencial con padding de 3 dígitos (ej: `SEI-008`).
- Todos los campos monetarios se almacenan como `DECIMAL(10, 2)` en MXN.
- Todos los campos de porcentaje se almacenan como `DECIMAL(7, 4)` (ej: `0.8333` = 83.33%).
- Los campos `created_at` y `updated_at` son automáticos en **todos** los modelos.
- Los campos calculados (`ganancia_bruta`, `utilidad`, `days_to_sell`, `dias_en_inventario`) **no se almacenan en DB**; se calculan como `@property` en el modelo Django o como anotaciones en el queryset. La excepción es `days_to_sell` al momento de cerrar una venta, que sí se persiste para historial.

### Soft delete
Todos los modelos principales implementan **eliminación lógica** mediante el campo `is_deleted = BooleanField(default=False)`. Ningún registro se borra físicamente de la DB. El Manager por defecto filtra `is_deleted=False`.

### Auditoría
Todos los modelos incluyen:
```
created_at    DateTimeField  auto_now_add=True
updated_at    DateTimeField  auto_now=True
created_by    FK → User      null=True
updated_by    FK → User      null=True
```

---

## 2. Módulo de Inventario

### 2.1 Responsabilidades del módulo

- [ ] Dar de alta, editar y eliminar (lógicamente) productos.
- [ ] Generar automáticamente el ID único del producto al seleccionar marca.
- [ ] Calcular en tiempo real la ganancia estimada al ingresar costo y precio.
- [ ] Mostrar la vista tabla y la vista de tarjetas (cards) del inventario.
- [ ] Filtrar productos por: marca, rango de precio, estado de venta, días en inventario, etiqueta de antigüedad.
- [ ] Buscar productos por ID, marca y modelo (búsqueda full-text tolerante a errores menores).
- [ ] Mostrar y actualizar la etiqueta de antigüedad automáticamente cada día.
- [ ] Emitir alerta visual cuando un producto supera los 60 días en inventario.
- [ ] Permitir importación masiva desde CSV/Excel (migración de datos históricos).
- [ ] Permitir subir una fotografía del reloj (opcional, máx 5 MB, JPG/PNG).
- [ ] Al registrar una venta, cambiar el estado del producto automáticamente a `Vendido`.
- [ ] Al registrar un apartado, cambiar el estado automáticamente a `Apartado`.
- [ ] Exponer endpoint REST para que el frontend consuma la lista paginada con filtros.

### 2.2 Modelo: `Product`

```
Tabla: inventory_product
```

| Campo | Tipo Django | DB type | Nullable | Default | Descripción |
|-------|-------------|---------|----------|---------|-------------|
| `id` | `AutoField` | SERIAL PK | No | auto | PK interna |
| `product_id` | `CharField(max_length=12, unique=True)` | VARCHAR(12) | No | auto-gen | ID visible (SEI-008) |
| `marca` | `CharField(max_length=60)` | VARCHAR(60) | No | — | Marca del reloj |
| `modelo` | `CharField(max_length=120)` | VARCHAR(120) | No | — | Modelo específico |
| `anio_estilo` | `CharField(max_length=30)` | VARCHAR(30) | Sí | NULL | Año o estilo (70's, 2019) |
| `descripcion` | `TextField` | TEXT | Sí | NULL | Descripción libre |
| `condicion` | `DecimalField(max_digits=3, decimal_places=1)` | DECIMAL(3,1) | No | — | Condición 1.0–10.0 |
| `costo_compra` | `DecimalField(max_digits=10, decimal_places=2)` | DECIMAL(10,2) | No | — | Precio pagado al proveedor (MXN) |
| `precio_venta` | `DecimalField(max_digits=10, decimal_places=2)` | DECIMAL(10,2) | No | — | Precio de lista al público (MXN) |
| `estado_venta` | `CharField(max_length=12, choices=EstadoVenta)` | VARCHAR(12) | No | `disponible` | Ver enum EstadoVenta |
| `fecha_compra` | `DateField` | DATE | No | — | Fecha de adquisición |
| `fecha_venta` | `DateField` | DATE | Sí | NULL | Fecha de venta (se llena al vender) |
| `canal_venta` | `CharField(max_length=20, choices=CanalVenta)` | VARCHAR(20) | Sí | NULL | Canal por el que se vendió |
| `days_to_sell` | `IntegerField` | INTEGER | Sí | NULL | Días hasta venta (persiste al cerrar venta) |
| `proveedor` | `CharField(max_length=120)` | VARCHAR(120) | Sí | NULL | Proveedor/vendedor original |
| `imagen` | `ImageField(upload_to='products/')` | VARCHAR(255) | Sí | NULL | Ruta de la foto |
| `notas` | `TextField` | TEXT | Sí | NULL | Notas internas |
| `is_deleted` | `BooleanField` | BOOLEAN | No | False | Soft delete |
| `created_at` | `DateTimeField(auto_now_add=True)` | TIMESTAMPTZ | No | auto | |
| `updated_at` | `DateTimeField(auto_now=True)` | TIMESTAMPTZ | No | auto | |
| `created_by` | `ForeignKey(User, null=True)` | INTEGER FK | Sí | NULL | |
| `updated_by` | `ForeignKey(User, null=True)` | INTEGER FK | Sí | NULL | |

**Propiedades calculadas (no persistidas en DB):**

```python
@property
def ganancia_bruta(self):
    # precio_venta - costo_total_adquisicion
    # costo_total_adquisicion viene del modelo PurchaseCost relacionado
    return self.precio_venta - self.purchase_cost.total_pagado

@property
def utilidad(self):
    # ganancia / costo_total * 100
    if self.purchase_cost.total_pagado == 0:
        return Decimal('0')
    return (self.ganancia_bruta / self.purchase_cost.total_pagado) * 100

@property
def dias_en_inventario(self):
    # Si ya se vendió, retorna days_to_sell persistido
    if self.estado_venta == 'vendido' and self.days_to_sell is not None:
        return self.days_to_sell
    return (date.today() - self.fecha_compra).days

@property
def etiqueta_antiguedad(self):
    d = self.dias_en_inventario
    if d < 30:   return 'nuevo'
    if d < 60:   return 'promover'
    if d < 90:   return 'descuento'
    return 'liquidar'
```

**Validaciones del modelo:**

- `condicion` debe estar entre `1.0` y `10.0` inclusive.
- `precio_venta` debe ser `> 0`.
- `costo_compra` debe ser `>= 0`.
- `precio_venta` debe ser `>= costo_compra` (warning, no error bloqueante — puede haber ventas a pérdida).
- `product_id` es único; la lógica de generación vive en el serializer/signal: toma los primeros 3 caracteres de la marca (uppercase), busca el último ID de esa marca en DB y suma 1.
- `fecha_venta` solo puede estar presente si `estado_venta == 'vendido'`.

**Índices recomendados:**

```sql
CREATE INDEX idx_product_marca ON inventory_product(marca);
CREATE INDEX idx_product_estado ON inventory_product(estado_venta);
CREATE INDEX idx_product_fecha_compra ON inventory_product(fecha_compra);
CREATE INDEX idx_product_is_deleted ON inventory_product(is_deleted);
```

---

## 3. Módulo de Costos de Compra

### 3.1 Responsabilidades del módulo

- [ ] Registrar el desglose completo de costos de adquisición por producto.
- [ ] Calcular automáticamente el `total_pagado` como suma de todos los componentes de costo.
- [ ] Asociar el método de pago de la compra a la cuenta correcta en el flujo de efectivo.
- [ ] Impedir que se registre más de un `PurchaseCost` por producto (relación 1:1).
- [ ] Permitir editar costos adicionales (mantenimiento, pila, limpieza) después del alta inicial.
- [ ] Disparar actualización del flujo de efectivo cuando se registra o edita un costo.

### 3.2 Modelo: `PurchaseCost`

```
Tabla: inventory_purchasecost
```

| Campo | Tipo Django | Nullable | Default | Descripción |
|-------|-------------|----------|---------|-------------|
| `id` | `AutoField` | No | auto | PK |
| `product` | `OneToOneField(Product)` | No | — | Relación 1:1 con Product |
| `fecha_compra` | `DateField` | No | — | Fecha de la compra (refleja Product.fecha_compra) |
| `costo_reloj` | `DecimalField(10,2)` | No | — | Precio pagado por el reloj |
| `costo_envio` | `DecimalField(10,2)` | No | `0.00` | Costo de envío de adquisición |
| `mantenimiento` | `DecimalField(10,2)` | No | `0.00` | Servicio, pila, limpieza |
| `otros_costos` | `DecimalField(10,2)` | No | `0.00` | Cualquier otro costo adicional |
| `total_pagado` | `DecimalField(10,2)` | No | calculado | Suma de todos los costos (ver property) |
| `metodo_pago` | `CharField(max_length=20, choices=MetodoPago)` | No | — | Método de pago de la compra |
| `cuenta_origen` | `CharField(max_length=20, choices=CuentaEfectivo)` | No | — | Cuenta desde la que se pagó |
| `notas` | `TextField` | Sí | NULL | Observaciones |
| `created_at` | `DateTimeField(auto_now_add=True)` | No | auto | |
| `updated_at` | `DateTimeField(auto_now=True)` | No | auto | |

**Propiedad calculada:**

```python
@property
def total_pagado(self):
    return self.costo_reloj + self.costo_envio + self.mantenimiento + self.otros_costos
```

> **Nota:** `total_pagado` se persiste en DB al guardar (pre_save signal) para que las consultas de agregación no necesiten calcular en tiempo real.

**Validaciones:**

- `costo_reloj` debe ser `>= 0`.
- Todos los componentes de costo deben ser `>= 0`.
- Solo puede existir un `PurchaseCost` por `Product` (garantizado por `OneToOneField`).

---

## 4. Módulo de Ventas

### 4.1 Responsabilidades del módulo

- [ ] Registrar ventas desde la vista del producto con un solo clic ("vender ahora").
- [ ] Al confirmar una venta:
  - Cambiar `Product.estado_venta` a `vendido`.
  - Llenar `Product.fecha_venta` con la fecha actual.
  - Calcular y persistir `Product.days_to_sell`.
  - Calcular `ganancia_bruta` y `porcentaje_ganancia`.
  - Crear automáticamente un movimiento en `FinanceEntry` tipo `ingreso` concepto `venta`.
- [ ] Mostrar historial completo de ventas con filtros por: rango de fechas, cliente, canal, método de pago, marca.
- [ ] Mostrar KPIs del período en la cabecera del historial.
- [ ] Permitir editar una venta dentro de las primeras 24 horas (con auditoría).
- [ ] Impedir registrar una venta sobre un producto con estado `vendido`.
- [ ] Asociar la venta a un cliente existente o crear uno nuevo en el mismo flujo.
- [ ] Exportar el historial filtrado a Excel y CSV.

### 4.2 Modelo: `Sale`

```
Tabla: sales_sale
```

| Campo | Tipo Django | Nullable | Default | Descripción |
|-------|-------------|----------|---------|-------------|
| `id` | `AutoField` | No | auto | PK |
| `product` | `OneToOneField(Product)` | No | — | Relación 1:1 — un reloj = una venta |
| `customer` | `ForeignKey(Customer, null=True)` | Sí | NULL | Cliente (opcional, puede ser venta anónima) |
| `fecha_venta` | `DateField` | No | `today` | Fecha de la transacción |
| `cliente_nombre` | `CharField(max_length=120)` | Sí | NULL | Nombre libre (si no hay Customer) |
| `cliente_contacto` | `CharField(max_length=80)` | Sí | NULL | Teléfono o @usuario |
| `metodo_pago` | `CharField(max_length=20, choices=MetodoPago)` | No | — | Método de pago |
| `canal_venta` | `CharField(max_length=20, choices=CanalVenta)` | No | — | Canal de la venta |
| `monto_pagado` | `DecimalField(10,2)` | No | — | Precio final cobrado al cliente |
| `extras` | `DecimalField(10,2)` | No | `0.00` | Accesorios, caja, etc. |
| `costo_envio_venta` | `DecimalField(10,2)` | No | `0.00` | Costo de envío al comprador |
| `costo_reloj_snapshot` | `DecimalField(10,2)` | No | — | Snapshot del costo total al momento de vender |
| `ganancia_bruta` | `DecimalField(10,2)` | No | calculado | monto_pagado - costo_reloj_snapshot - extras - costo_envio |
| `porcentaje_ganancia` | `DecimalField(7,4)` | No | calculado | ganancia_bruta / costo_reloj_snapshot |
| `notas` | `TextField` | Sí | NULL | Observaciones |
| `is_deleted` | `BooleanField` | No | False | Soft delete |
| `created_at` | `DateTimeField(auto_now_add=True)` | No | auto | |
| `updated_at` | `DateTimeField(auto_now=True)` | No | auto | |
| `created_by` | `ForeignKey(User, null=True)` | Sí | NULL | Quién registró la venta |

**Lógica de cálculo al guardar:**

```python
def save(self, *args, **kwargs):
    # Snapshot del costo al momento de venta (inmutable en historial)
    if not self.costo_reloj_snapshot:
        self.costo_reloj_snapshot = self.product.purchase_cost.total_pagado
    # Calcular ganancia
    self.ganancia_bruta = (
        self.monto_pagado
        - self.costo_reloj_snapshot
        - self.extras
        - self.costo_envio_venta
    )
    # Calcular porcentaje
    if self.costo_reloj_snapshot > 0:
        self.porcentaje_ganancia = self.ganancia_bruta / self.costo_reloj_snapshot
    super().save(*args, **kwargs)
```

**Validaciones:**

- `monto_pagado` debe ser `> 0`.
- `product.estado_venta` debe ser `disponible` o `apartado` al momento de crear la venta (no `vendido`).
- Si `customer` es `null`, al menos `cliente_nombre` debe estar presente.
- `fecha_venta` no puede ser futura.

---

## 5. Módulo de Pagos y Apartados

### 5.1 Responsabilidades del módulo

- [ ] Registrar un apartado: producto pasa a estado `apartado` con pago inicial registrado.
- [ ] Registrar abonos adicionales al apartado.
- [ ] Calcular automáticamente el saldo pendiente en cada abono.
- [ ] Al completar el pago total, cerrar el apartado y generar la `Sale` final.
- [ ] Emitir alerta cuando un apartado supera la fecha límite sin completarse.
- [ ] Cada pago registrado crea un `FinanceEntry` correspondiente.
- [ ] Mostrar historial de todos los apartados (activos, completados, cancelados).

### 5.2 Modelo: `Layaway` (Apartado)

```
Tabla: payments_layaway
```

| Campo | Tipo Django | Nullable | Default | Descripción |
|-------|-------------|----------|---------|-------------|
| `id` | `AutoField` | No | auto | PK |
| `product` | `OneToOneField(Product)` | No | — | Producto apartado |
| `customer` | `ForeignKey(Customer, null=True)` | Sí | NULL | Cliente |
| `cliente_nombre` | `CharField(max_length=120)` | Sí | NULL | Nombre libre si no hay Customer |
| `cliente_contacto` | `CharField(max_length=80)` | Sí | NULL | Teléfono o @usuario |
| `precio_acordado` | `DecimalField(10,2)` | No | — | Precio final acordado con el cliente |
| `fecha_inicio` | `DateField` | No | `today` | Fecha de inicio del apartado |
| `fecha_limite` | `DateField` | Sí | NULL | Fecha límite de pago total (opcional) |
| `estado` | `CharField(max_length=20, choices=EstadoApartado)` | No | `activo` | activo / completado / cancelado |
| `total_abonado` | `DecimalField(10,2)` | No | `0.00` | Suma de todos los pagos realizados (auto) |
| `saldo_pendiente` | `DecimalField(10,2)` | No | calculado | precio_acordado - total_abonado |
| `notas` | `TextField` | Sí | NULL | Condiciones acordadas |
| `sale` | `OneToOneField(Sale, null=True)` | Sí | NULL | Sale generada al completar |
| `created_at` | `DateTimeField(auto_now_add=True)` | No | auto | |
| `updated_at` | `DateTimeField(auto_now=True)` | No | auto | |
| `created_by` | `ForeignKey(User, null=True)` | Sí | NULL | |

### 5.3 Modelo: `LayawayPayment` (Abono)

```
Tabla: payments_layawaypayment
```

| Campo | Tipo Django | Nullable | Default | Descripción |
|-------|-------------|----------|---------|-------------|
| `id` | `AutoField` | No | auto | PK |
| `layaway` | `ForeignKey(Layaway)` | No | — | Apartado al que pertenece |
| `fecha` | `DateField` | No | `today` | Fecha del abono |
| `monto` | `DecimalField(10,2)` | No | — | Monto del abono |
| `metodo_pago` | `CharField(max_length=20, choices=MetodoPago)` | No | — | Método del abono |
| `cuenta_destino` | `CharField(max_length=20, choices=CuentaEfectivo)` | No | — | Cuenta donde ingresó el dinero |
| `notas` | `CharField(max_length=200)` | Sí | NULL | Referencia del pago |
| `created_at` | `DateTimeField(auto_now_add=True)` | No | auto | |
| `created_by` | `ForeignKey(User, null=True)` | Sí | NULL | |

**Signal al guardar `LayawayPayment`:**

```python
@receiver(post_save, sender=LayawayPayment)
def update_layaway_totals(sender, instance, **kwargs):
    layaway = instance.layaway
    layaway.total_abonado = layaway.payments.aggregate(Sum('monto'))['monto__sum'] or 0
    layaway.saldo_pendiente = layaway.precio_acordado - layaway.total_abonado
    # Si saldo = 0, cerrar apartado y generar Sale
    if layaway.saldo_pendiente <= 0:
        layaway.estado = 'completado'
        # Crear Sale con monto = precio_acordado
        sale = Sale.objects.create(product=layaway.product, ...)
        layaway.sale = sale
        layaway.product.estado_venta = 'vendido'
        layaway.product.fecha_venta = date.today()
        layaway.product.save()
    layaway.save()
```

**Validaciones:**

- `monto` del abono debe ser `> 0`.
- `monto` del abono no puede superar el `saldo_pendiente` actual.
- No se pueden agregar abonos a un apartado con estado `completado` o `cancelado`.

---

## 6. Módulo de Clientes

### 6.1 Responsabilidades del módulo

- [ ] Alta, edición y eliminación lógica de clientes.
- [ ] Búsqueda por nombre o teléfono (búsqueda parcial, case-insensitive).
- [ ] Ver perfil completo con historial de compras y totales calculados.
- [ ] Crear cliente directamente desde el flujo de venta sin salir del formulario.
- [ ] Detectar duplicados por teléfono o Instagram antes de crear un nuevo registro.
- [ ] Calcular automáticamente `total_compras` y `total_gastado` como anotaciones del queryset.

### 6.2 Modelo: `Customer`

```
Tabla: customers_customer
```

| Campo | Tipo Django | Nullable | Default | Descripción |
|-------|-------------|----------|---------|-------------|
| `id` | `AutoField` | No | auto | PK |
| `nombre` | `CharField(max_length=120)` | No | — | Nombre completo |
| `telefono` | `CharField(max_length=20)` | Sí | NULL | Número de WhatsApp/teléfono |
| `instagram` | `CharField(max_length=80)` | Sí | NULL | @usuario de Instagram |
| `email` | `EmailField` | Sí | NULL | Correo electrónico |
| `notas` | `TextField` | Sí | NULL | Observaciones y preferencias |
| `is_deleted` | `BooleanField` | No | False | Soft delete |
| `created_at` | `DateTimeField(auto_now_add=True)` | No | auto | Fecha de primer registro |
| `updated_at` | `DateTimeField(auto_now=True)` | No | auto | |
| `created_by` | `ForeignKey(User, null=True)` | Sí | NULL | |

**Propiedades calculadas (vía queryset annotation):**

```python
# En el Manager o ViewSet
Customer.objects.annotate(
    total_compras=Count('sale'),
    total_gastado=Sum('sale__monto_pagado'),
    ultima_compra=Max('sale__fecha_venta'),
)
```

**Validaciones:**

- Al menos uno de los campos de contacto (`telefono`, `instagram`, `email`) debe estar presente.
- Si se provee `telefono`, validar formato básico (10 dígitos, aceptar espacios y guiones).
- No puede existir dos clientes activos con el mismo `telefono` o el mismo `instagram`.

**Índices:**

```sql
CREATE INDEX idx_customer_nombre ON customers_customer(nombre);
CREATE INDEX idx_customer_telefono ON customers_customer(telefono);
```

---

## 7. Módulo de Finanzas

### 7.1 Responsabilidades del módulo

- [ ] Registrar manualmente movimientos de ingreso y egreso.
- [ ] Crear movimientos automáticamente al registrar ventas (ingreso) y compras (egreso).
- [ ] Mostrar el saldo actual de cada cuenta (Efectivo, BBVA, Crédito, AMEX).
- [ ] Filtrar movimientos por: período, tipo (ingreso/egreso), cuenta, concepto.
- [ ] Garantizar que la suma de movimientos por cuenta refleje el saldo correcto.
- [ ] Exportar movimientos a Excel/CSV.

### 7.2 Modelo: `FinanceEntry`

```
Tabla: finances_financeentry
```

| Campo | Tipo Django | Nullable | Default | Descripción |
|-------|-------------|----------|---------|-------------|
| `id` | `AutoField` | No | auto | PK |
| `fecha` | `DateField` | No | `today` | Fecha del movimiento |
| `tipo` | `CharField(max_length=10, choices=TipoMovimiento)` | No | — | `ingreso` o `egreso` |
| `concepto` | `CharField(max_length=30, choices=ConceptoFinanciero)` | No | — | Ver enum ConceptoFinanciero |
| `monto` | `DecimalField(10,2)` | No | — | Siempre positivo; el tipo define el signo |
| `metodo_pago` | `CharField(max_length=20, choices=MetodoPago)` | No | — | Medio del movimiento |
| `cuenta` | `CharField(max_length=20, choices=CuentaEfectivo)` | No | — | Cuenta afectada |
| `notas` | `CharField(max_length=300)` | Sí | NULL | Descripción libre |
| `product` | `ForeignKey(Product, null=True)` | Sí | NULL | Reloj relacionado (opcional) |
| `sale` | `ForeignKey(Sale, null=True)` | Sí | NULL | Venta relacionada (opcional) |
| `is_automatic` | `BooleanField` | No | False | True si fue creado por signal del sistema |
| `is_deleted` | `BooleanField` | No | False | Soft delete |
| `created_at` | `DateTimeField(auto_now_add=True)` | No | auto | |
| `created_by` | `ForeignKey(User, null=True)` | Sí | NULL | |

### 7.3 Modelo: `AccountBalance` (saldo por cuenta)

> Este modelo es una **vista materializada** o tabla de caché actualizada por signals. No se edita manualmente.

```
Tabla: finances_accountbalance
```

| Campo | Tipo Django | Descripción |
|-------|-------------|-------------|
| `id` | `AutoField` | PK |
| `cuenta` | `CharField(max_length=20, unique=True)` | efectivo / bbva / credito / amex |
| `saldo` | `DecimalField(12,2)` | Saldo actual calculado |
| `updated_at` | `DateTimeField(auto_now=True)` | Última actualización |

**Cálculo del saldo:**

```python
# Signal post_save en FinanceEntry
@receiver(post_save, sender=FinanceEntry)
def update_account_balance(sender, instance, **kwargs):
    balance = AccountBalance.objects.get_or_create(cuenta=instance.cuenta)[0]
    total_ingresos = FinanceEntry.objects.filter(
        cuenta=instance.cuenta, tipo='ingreso', is_deleted=False
    ).aggregate(Sum('monto'))['monto__sum'] or 0
    total_egresos = FinanceEntry.objects.filter(
        cuenta=instance.cuenta, tipo='egreso', is_deleted=False
    ).aggregate(Sum('monto'))['monto__sum'] or 0
    balance.saldo = total_ingresos - total_egresos
    balance.save()
```

**Validaciones:**

- `monto` siempre debe ser `> 0` (el tipo define ingreso/egreso, no el signo del monto).
- Los movimientos generados automáticamente (`is_automatic=True`) no pueden editarse ni eliminarse desde la UI.

---

## 8. Módulo de Dashboard

### 8.1 Responsabilidades del módulo

- [ ] Calcular y servir todos los KPIs en tiempo real desde un endpoint dedicado `/api/dashboard/kpis/`.
- [ ] Soportar filtro por período: día, mes, año o rango personalizado.
- [ ] Calcular KPIs de ventas: total vendido, ganancia total, ticket promedio.
- [ ] Calcular KPIs de inventario: capital en inventario, unidades por estado, ratio inv/ventas.
- [ ] Calcular métricas de velocidad: avg days to sell, fast movers, slow movers.
- [ ] Proveer datos para gráficas: ventas por mes, ganancia por mes, revenue por mes.
- [ ] Proveer tablas analíticas: marcas más vendidas, stock por marca, canales de venta.
- [ ] Emitir alertas activas: productos con 60+ días en inventario.

### 8.2 Endpoint: `GET /api/dashboard/kpis/`

Este endpoint no tiene modelo propio en DB. Responde con datos calculados desde queries sobre los modelos existentes.

**Parámetros de query:**
- `period`: `day` | `month` | `year` | `custom` (default: `month`)
- `date_from`: `YYYY-MM-DD` (requerido si `period=custom`)
- `date_to`: `YYYY-MM-DD` (requerido si `period=custom`)

**Estructura de respuesta esperada:**

```json
{
  "period": "month",
  "date_from": "2026-03-01",
  "date_to": "2026-03-31",
  "kpis": {
    "ventas_totales": 81630.00,
    "ganancia_total": 33324.11,
    "costo_ventas": 43763.50,
    "ticket_promedio": 2720.00,
    "transacciones": 30,
    "capital_inventario": 71100.00,
    "inv_sales_ratio": 0.871,
    "avg_days_to_sell": 32,
    "productos_disponibles": 28,
    "productos_apartados": 3,
    "productos_vendidos_periodo": 8
  },
  "charts": {
    "ventas_por_mes": [
      {"mes": "2025-10", "ventas": 52395, "ganancia": 23068, "costo": 50037},
      ...
    ],
    "canales": [
      {"canal": "marketplace", "porcentaje": 66.0, "monto": 53875},
      ...
    ],
    "marcas_vendidas": [
      {"marca": "Seiko", "unidades": 6, "avg_days": 9, "revenue": 14400},
      ...
    ],
    "stock_por_marca": [
      {"marca": "Bulova", "unidades": 2, "valor": 6400},
      ...
    ]
  },
  "alerts": [
    {"product_id": "SEI-008", "modelo": "Seiko DX", "dias": 66, "etiqueta": "descuento"},
    ...
  ]
}
```

---

## 9. Módulo de Reportes

### 9.1 Responsabilidades del módulo

- [ ] Generar los siguientes reportes exportables en formato Excel (.xlsx) y CSV:

| Reporte | Filtros disponibles |
|---------|---------------------|
| Ventas por mes / año | `date_from`, `date_to`, `canal`, `marca`, `metodo_pago` |
| Ganancia por período | `date_from`, `date_to` |
| Ventas por marca | `date_from`, `date_to`, `marca` |
| Top productos vendidos | `date_from`, `date_to` |
| Slow movers (productos lentos) | `dias_minimos` (default: 60) |
| Inventario actual | `estado`, `marca`, `etiqueta_antiguedad` |
| Costo de adquisición | `date_from`, `date_to`, `metodo_pago` |
| Flujo de efectivo | `date_from`, `date_to`, `cuenta`, `tipo` |
| Historial por cliente | `customer_id` |

- [ ] El endpoint de exportación es `GET /api/reports/{type}/export/?format=xlsx|csv&...params`.
- [ ] Los archivos se generan en el servidor con `openpyxl` (Excel) y `csv` (Python stdlib).
- [ ] El nombre del archivo descargado debe incluir el tipo de reporte y la fecha de generación (ej: `ventas_por_mes_2026-03-25.xlsx`).
- [ ] No requiere modelo de DB propio; opera sobre queries de los modelos existentes.

---

## 10. Módulo de Usuarios y Autenticación

### 10.1 Responsabilidades del módulo

- [ ] Autenticación mediante JWT con `djangorestframework-simplejwt`.
- [ ] Endpoint `POST /api/auth/login/` → devuelve `access` (8h) y `refresh` (7d).
- [ ] Endpoint `POST /api/auth/refresh/` → renueva el token de acceso.
- [ ] Endpoint `POST /api/auth/logout/` → invalida el refresh token.
- [ ] Protección de todas las rutas de la API: requieren `Authorization: Bearer <token>`.
- [ ] Sistema de permisos basado en roles: `Admin` y `Vendedor`.
- [ ] El rol se verifica en cada endpoint mediante permisos de DRF personalizados.
- [ ] Solo el `Admin` puede gestionar usuarios.
- [ ] Registro de auditoría: cada `Sale`, `FinanceEntry` y cambio de `Product` queda ligado al usuario que lo realizó.

### 10.2 Modelo: `User` (extendido de `AbstractUser`)

```
Tabla: auth_user (extendido)
```

| Campo | Tipo Django | Nullable | Default | Descripción |
|-------|-------------|----------|---------|-------------|
| `id` | `AutoField` | No | auto | PK |
| `username` | `CharField(max_length=150, unique=True)` | No | — | Nombre de usuario |
| `email` | `EmailField(unique=True)` | No | — | Correo (se usa para login) |
| `first_name` | `CharField(max_length=150)` | No | — | Nombre |
| `last_name` | `CharField(max_length=150)` | Sí | NULL | Apellido |
| `role` | `CharField(max_length=20, choices=UserRole)` | No | `vendedor` | Ver enum UserRole |
| `is_active` | `BooleanField` | No | True | Habilitado/deshabilitado |
| `last_login` | `DateTimeField` | Sí | NULL | Último acceso (Django built-in) |
| `created_at` | `DateTimeField(auto_now_add=True)` | No | auto | |

### 10.3 Modelo: `AuditLog`

```
Tabla: audit_auditlog
```

| Campo | Tipo Django | Descripción |
|-------|-------------|-------------|
| `id` | `AutoField` | PK |
| `user` | `ForeignKey(User)` | Quién realizó la acción |
| `action` | `CharField(max_length=20)` | `create` / `update` / `delete` / `sell` |
| `model_name` | `CharField(max_length=50)` | Modelo afectado (Product, Sale, etc.) |
| `object_id` | `CharField(max_length=50)` | ID del objeto afectado |
| `object_repr` | `CharField(max_length=200)` | Representación legible del objeto |
| `changes` | `JSONField` | Diff de campos antes/después (para update) |
| `timestamp` | `DateTimeField(auto_now_add=True)` | Cuándo ocurrió |
| `ip_address` | `GenericIPAddressField(null=True)` | IP del cliente |

**Permisos por endpoint:**

| Acción | Admin | Vendedor |
|--------|-------|----------|
| GET /api/inventory/ | ✓ | ✓ (lectura) |
| POST/PUT/DELETE /api/inventory/ | ✓ | ✗ |
| GET/POST /api/sales/ | ✓ | ✓ |
| DELETE /api/sales/ | ✓ | ✗ |
| /api/customers/ (CRUD) | ✓ | ✓ |
| /api/finances/ | ✓ | ✗ |
| /api/dashboard/ | ✓ | ✗ |
| /api/reports/ | ✓ | ✗ |
| /api/users/ | ✓ | ✗ |

---

## 11. Automatizaciones del sistema

Estas son las acciones automáticas que el sistema debe ejecutar sin intervención del usuario. Se implementan mediante **Django Signals** (síncronas, en el mismo proceso) y **Celery Beat tasks** (asíncronas, programadas).

### 11.1 Signals síncronos (instantáneos)

| Disparador | Modelo/Signal | Acciones automáticas |
|-----------|--------------|---------------------|
| Se crea un `Product` | `post_save` | Generar `product_id` automático basado en marca + secuencial. Crear el registro `PurchaseCost` vacío asociado. |
| Se crea un `Sale` | `post_save` | 1. Actualizar `Product.estado_venta = 'vendido'`. 2. Llenar `Product.fecha_venta` con la fecha del día. 3. Calcular y persistir `Product.days_to_sell`. 4. Crear `FinanceEntry` tipo `ingreso`, concepto `venta`, monto = `Sale.monto_pagado`. |
| Se crea un `Layaway` | `post_save` | 1. Actualizar `Product.estado_venta = 'apartado'`. 2. Crear `FinanceEntry` tipo `ingreso`, concepto `abono_apartado` por el enganche inicial. |
| Se completa un `Layaway` (saldo = 0) | `post_save` en `LayawayPayment` | 1. Crear `Sale` con monto = `precio_acordado`. 2. Actualizar `Product.estado_venta = 'vendido'`. 3. Llenar `Product.fecha_venta`. 4. Marcar `Layaway.estado = 'completado'`. |
| Se crea un `PurchaseCost` | `post_save` | Crear `FinanceEntry` tipo `egreso`, concepto `compra`, monto = `total_pagado`. |
| Cualquier `FinanceEntry` guardado | `post_save` | Recalcular `AccountBalance.saldo` para la cuenta afectada. |

### 11.2 Tareas Celery programadas (asíncronas)

| Tarea | Frecuencia | Acción |
|-------|-----------|--------|
| `update_inventory_age` | Cada día a las 00:05 | Recalcular y actualizar la etiqueta de antigüedad de todos los productos con `estado_venta = 'disponible'`. |
| `alert_old_inventory` | Cada día a las 09:00 | Identificar productos con `dias_en_inventario > 60` y crear notificaciones internas en `Notification` para el Admin. |
| `alert_layaway_overdue` | Cada día a las 09:00 | Identificar apartados activos con `fecha_limite < today` y crear notificaciones de alerta. |

### 11.3 Modelo: `Notification`

```
Tabla: core_notification
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `AutoField` | PK |
| `user` | `ForeignKey(User)` | Usuario destinatario |
| `tipo` | `CharField` | `inventario_viejo` / `apartado_vencido` / `sin_stock` |
| `mensaje` | `TextField` | Texto de la alerta |
| `product` | `FK(Product, null=True)` | Producto relacionado |
| `is_read` | `BooleanField` | False = no leída |
| `created_at` | `DateTimeField(auto_now_add=True)` | |

---

## 12. Diagrama de relaciones (ERD resumen)

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────┐
│    User      │      │     Product       │      │ PurchaseCost │
│─────────────│      │──────────────────│      │──────────────│
│ id          │◄─────│ created_by (FK)   │──1:1─│ product (FK) │
│ email       │      │ product_id        │      │ costo_reloj  │
│ role        │      │ marca             │      │ costo_envio  │
│ is_active   │      │ modelo            │      │ mantenimiento│
└─────────────┘      │ condicion         │      │ total_pagado │
                     │ costo_compra      │      └──────────────┘
                     │ precio_venta      │
                     │ estado_venta      │──1:1──►┌──────────┐
                     │ fecha_compra      │        │  Sale    │
                     └──────────────────┘        │──────────│
                              │                  │ product  │
                              │ 1:1              │ customer │
                              ▼                  │ monto    │
                     ┌──────────────────┐        │ ganancia │
                     │    Layaway       │        └──────────┘
                     │──────────────────│              │
                     │ product (FK 1:1) │              │ N:1
                     │ customer (FK)    │              ▼
                     │ precio_acordado  │        ┌──────────┐
                     │ estado           │        │ Customer │
                     │ sale (FK 1:1)    │        │──────────│
                     └──────────────────┘        │ nombre   │
                              │                  │ telefono │
                              │ 1:N              │ instagram│
                              ▼                  └──────────┘
                     ┌──────────────────┐
                     │ LayawayPayment   │
                     │──────────────────│
                     │ layaway (FK)     │        ┌──────────────┐
                     │ monto            │        │ FinanceEntry │
                     │ metodo_pago      │        │──────────────│
                     └──────────────────┘        │ tipo         │
                                                 │ concepto     │
                     ┌──────────────────┐        │ monto        │
                     │ AccountBalance   │        │ cuenta       │
                     │──────────────────│        │ product (FK) │
                     │ cuenta (unique)  │        │ sale (FK)    │
                     │ saldo            │        └──────────────┘
                     └──────────────────┘
```

---

## 13. Enumeraciones globales

Todos los `choices` se definen como clases `TextChoices` en `core/enums.py` y se importan en cada modelo.

### `EstadoVenta`
```python
class EstadoVenta(models.TextChoices):
    DISPONIBLE = 'disponible', 'Disponible'
    APARTADO   = 'apartado',   'Apartado'
    VENDIDO    = 'vendido',    'Vendido'
```

### `EstadoApartado`
```python
class EstadoApartado(models.TextChoices):
    ACTIVO      = 'activo',      'Activo'
    COMPLETADO  = 'completado',  'Completado'
    CANCELADO   = 'cancelado',   'Cancelado'
```

### `CanalVenta`
```python
class CanalVenta(models.TextChoices):
    MARKETPLACE = 'marketplace', 'Marketplace (Facebook)'
    INSTAGRAM   = 'instagram',   'Instagram'
    WHATSAPP    = 'whatsapp',    'WhatsApp'
    DIRECTO     = 'directo',     'Directo / Presencial'
    OTRO        = 'otro',        'Otro'
```

### `MetodoPago`
```python
class MetodoPago(models.TextChoices):
    EFECTIVO      = 'efectivo',      'Efectivo'
    TRANSFERENCIA = 'transferencia', 'Transferencia bancaria'
    TARJETA       = 'tarjeta',       'Tarjeta de crédito/débito'
    MSI           = 'msi',           'Meses sin intereses'
    CONSIGNA      = 'consigna',      'Consigna'
```

### `CuentaEfectivo`
```python
class CuentaEfectivo(models.TextChoices):
    EFECTIVO = 'efectivo', 'Efectivo'
    BBVA     = 'bbva',     'BBVA'
    CREDITO  = 'credito',  'Crédito'
    AMEX     = 'amex',     'AMEX'
```

### `TipoMovimiento`
```python
class TipoMovimiento(models.TextChoices):
    INGRESO = 'ingreso', 'Ingreso'
    EGRESO  = 'egreso',  'Egreso'
```

### `ConceptoFinanciero`
```python
class ConceptoFinanciero(models.TextChoices):
    VENTA              = 'venta',              'Venta de reloj'
    COMPRA             = 'compra',             'Compra de reloj'
    ABONO_CAPITAL      = 'abono_capital',      'Abono al capital'
    ABONO_APARTADO     = 'abono_apartado',     'Abono de apartado'
    GASTO_OPERATIVO    = 'gasto_operativo',    'Gasto operativo'
    ENVIO              = 'envio',              'Costo de envío'
    MANTENIMIENTO      = 'mantenimiento',      'Mantenimiento / Pila'
    OTRO               = 'otro',               'Otro'
```

### `EtiquetaAntiguedad`
```python
class EtiquetaAntiguedad(models.TextChoices):
    NUEVO     = 'nuevo',     'Nuevo (<30 días)'
    PROMOVER  = 'promover',  'Promover (30–60 días)'
    DESCUENTO = 'descuento', 'Descuento (60–90 días)'
    LIQUIDAR  = 'liquidar',  'Liquidar (90+ días)'
```

### `UserRole`
```python
class UserRole(models.TextChoices):
    ADMIN    = 'admin',    'Administrador'
    VENDEDOR = 'vendedor', 'Vendedor'
```

### `PrefijosID` (diccionario, no enum)
```python
PREFIJOS_MARCA = {
    'hamilton':   'HAM',
    'seiko':      'SEI',
    'casio':      'CAS',
    'g-shock':    'G-S',
    'citizen':    'CIT',
    'timex':      'TIM',
    'tissot':     'TIS',
    'omega':      'OME',
    'orient':     'ORI',
    'bulova':     'BUL',
    'victorinox': 'VIC',
    # Para marcas no listadas: primeras 3 letras en uppercase
}

def generar_product_id(marca: str) -> str:
    prefix = PREFIJOS_MARCA.get(marca.lower(), marca[:3].upper())
    ultimo = Product.objects.filter(
        product_id__startswith=prefix
    ).order_by('-product_id').first()
    if ultimo:
        num = int(ultimo.product_id.split('-')[1]) + 1
    else:
        num = 1
    return f"{prefix}-{num:03d}"
```

---

## 14. Reglas de validación globales

Estas reglas aplican en todos los serializers de la API y se ejecutan antes de cualquier escritura en DB.

### Reglas monetarias
- Todo campo de tipo precio/monto que no sea explícitamente un costo de envío o extra, debe ser `> 0`.
- Costos opcionales (envío, mantenimiento, extras) deben ser `>= 0`.
- Ningún campo monetario puede superar `DECIMAL(10,2)` → límite de `$99,999,999.99 MXN`.

### Reglas de estado de producto
- Un producto no puede pasar de `vendido` a ningún otro estado (operación irreversible desde la UI).
- Solo el Admin puede cambiar el estado de `apartado` a `disponible` (cancelar un apartado).
- El estado `disponible` es el único estado desde el que se puede crear un `Layaway` nuevo.

### Reglas de integridad referencial
- No se puede eliminar un `Product` que tenga una `Sale` asociada (soft delete obligatorio).
- No se puede eliminar un `Customer` que tenga `Sale`s asociadas (soft delete obligatorio).
- No se puede eliminar un `FinanceEntry` con `is_automatic=True` desde la API (solo auditoría manual).

### Reglas de fechas
- `fecha_venta` ≥ `fecha_compra` del producto.
- `fecha_limite` de un Layaway debe ser posterior a `fecha_inicio`.
- No se pueden registrar ventas con fecha futura.
- No se pueden registrar compras con fecha futura.

### Reglas de unicidad
- `product_id` es globalmente único en toda la tabla `Product` (activos y eliminados).
- Un `Product` solo puede tener un `PurchaseCost` (OneToOne).
- Un `Product` solo puede tener una `Sale` (OneToOne).
- Un `Product` solo puede tener un `Layaway` activo a la vez.

---

*Documento generado para el proyecto ATCoPOS · Alternative Time Co. · 2026*
*Este archivo es la fuente de verdad técnica para el equipo de desarrollo.*