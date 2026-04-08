import csv
import io
import unicodedata
from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.db.models import Q
from django.db import transaction
from django.utils import timezone
from rest_framework.viewsets import ModelViewSet
from rest_framework import serializers, status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from finance.services import delete_purchase_cost_line_relationship, sync_purchase_cost_line_finance_entry

from .models import InventoryItem, PurchaseCostLine
from .serializers import InventoryItemSerializer, PurchaseCostLineSerializer


class InventoryItemViewSet(ModelViewSet):
    serializer_class = InventoryItemSerializer

    def get_queryset(self):
        queryset = InventoryItem.objects.select_related("purchase_cost").prefetch_related("purchase_cost_lines")
        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(product_id__icontains=search)
                | Q(sku__icontains=search)
                | Q(brand__icontains=search)
                | Q(model_name__icontains=search)
            )

        brand = params.get("brand")
        if brand:
            queryset = queryset.filter(brand__iexact=brand)

        status_value = params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)

        tag = params.get("tag")
        if tag:
            queryset = queryset.filter(tag=tag)

        return queryset

    @action(detail=True, methods=["get", "post"], url_path="costs")
    def costs(self, request, pk=None):
        product = self.get_object()
        if request.method.lower() == "get":
            serializer = PurchaseCostLineSerializer(product.purchase_cost_lines.all(), many=True)
            return Response(serializer.data)

        if (
            request.data.get("cost_type") == PurchaseCostLine.TYPE_WATCH
            and product.purchase_cost_lines.filter(cost_type=PurchaseCostLine.TYPE_WATCH, is_deleted=False).exists()
        ):
            return Response(
                {"cost_type": "Este reloj ya tiene costo de reloj. Edita el existente."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PurchaseCostLineSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            cost_line = serializer.save(
                product=product,
                created_by=request.user,
                updated_by=request.user,
            )
            sync_purchase_cost_line_finance_entry(cost_line)
        output = PurchaseCostLineSerializer(cost_line)
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch", "delete"], url_path=r"costs/(?P<cost_id>[^/.]+)")
    def cost_detail(self, request, pk=None, cost_id=None):
        product = self.get_object()
        cost_line = product.purchase_cost_lines.filter(id=cost_id).first()
        if cost_line is None:
            return Response({"detail": "No encontramos ese costo en este reloj."}, status=status.HTTP_404_NOT_FOUND)

        if request.method.lower() == "delete":
            if cost_line.cost_type == PurchaseCostLine.TYPE_WATCH:
                return Response(
                    {"detail": "El costo del reloj es fijo y no se puede eliminar."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            with transaction.atomic():
                delete_purchase_cost_line_relationship(cost_line, request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)

        old_account = cost_line.account
        serializer = PurchaseCostLineSerializer(cost_line, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            serializer.save(updated_by=request.user)
            sync_purchase_cost_line_finance_entry(cost_line)
            if old_account != cost_line.account:
                from finance.services import recalculate_account_balance

                recalculate_account_balance(old_account)
        return Response(PurchaseCostLineSerializer(cost_line).data)

    @action(
        detail=False,
        methods=["post"],
        url_path="import-csv",
        parser_classes=[MultiPartParser, FormParser],
    )
    def import_csv(self, request):
        uploaded_file = request.FILES.get("file")
        if uploaded_file is None:
            return Response(
                {"detail": "Debes adjuntar un archivo CSV en el campo file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            text_stream = io.TextIOWrapper(uploaded_file.file, encoding="utf-8-sig")
            reader = csv.DictReader(text_stream)
        except Exception:
            return Response(
                {"detail": "No pudimos leer el archivo CSV."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not reader.fieldnames:
            return Response(
                {"detail": "El CSV no contiene encabezados."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_count = 0
        failed_count = 0
        errors = []

        for row_number, row in enumerate(reader, start=2):
            if all(not str(value or "").strip() for value in row.values()):
                continue
            try:
                payload = self._build_payload(row)
                serializer = InventoryItemSerializer(data=payload, context={"request": request})
                serializer.is_valid(raise_exception=True)
                serializer.save()
                created_count += 1
            except serializers.ValidationError as exc:
                failed_count += 1
                errors.append({"row": row_number, "errors": exc.detail})
            except ValueError as exc:
                failed_count += 1
                errors.append({"row": row_number, "errors": {"non_field_errors": [str(exc)]}})
            except Exception as exc:
                failed_count += 1
                errors.append(
                    {
                        "row": row_number,
                        "errors": {
                            "non_field_errors": [f"Error inesperado en la fila {row_number}: {exc}"],
                        },
                    }
                )

        response_status = (
            status.HTTP_201_CREATED if failed_count == 0 else status.HTTP_207_MULTI_STATUS
        )
        return Response(
            {
                "created": created_count,
                "failed": failed_count,
                "total_rows": created_count + failed_count,
                "errors": errors,
            },
            status=response_status,
        )

    def _build_payload(self, row):
        purchase_date = self._parse_date(self._csv_value(row, "purchase_date")) or timezone.localdate()
        watch_cost = self._parse_decimal(self._csv_value(row, "watch_cost")) or Decimal("0.00")
        shipping_cost = self._parse_decimal(self._csv_value(row, "shipping_cost")) or Decimal("0.00")
        maintenance_cost = self._parse_decimal(self._csv_value(row, "maintenance_cost")) or Decimal("0.00")
        other_costs = self._parse_decimal(self._csv_value(row, "other_costs")) or Decimal("0.00")
        price = self._parse_decimal(self._csv_value(row, "price"), required=True)
        condition_score = self._parse_decimal(self._csv_value(row, "condition_score")) or Decimal("8.0")

        brand = self._csv_value(row, "brand")
        model_name = self._csv_value(row, "model_name")
        if not brand:
            raise ValueError("La fila no incluye marca.")
        if not model_name:
            raise ValueError("La fila no incluye modelo.")

        payload = {
            "brand": brand,
            "model_name": model_name,
            "year_label": self._csv_value(row, "year_label"),
            "condition_score": condition_score,
            "provider": self._csv_value(row, "provider"),
            "description": self._csv_value(row, "description"),
            "notes": self._csv_value(row, "notes"),
            "price": price,
            "purchase_date": purchase_date,
            "status": self._map_choice(self._csv_value(row, "status"), self._status_map(), "available"),
            "sales_channel": self._map_choice(
                self._csv_value(row, "sales_channel"), self._sales_channel_map(), "marketplace"
            ),
            "purchase_cost": {
                "watch_cost": watch_cost,
                "shipping_cost": shipping_cost,
                "maintenance_cost": maintenance_cost,
                "other_costs": other_costs,
                "payment_method": self._map_choice(
                    self._csv_value(row, "payment_method"), self._payment_method_map(), "cash"
                ),
                "source_account": self._map_choice(
                    self._csv_value(row, "source_account"), self._source_account_map(), "cash"
                ),
                "notes": self._csv_value(row, "purchase_notes") or self._csv_value(row, "notes"),
            },
        }
        return payload

    @staticmethod
    def _normalize_text(value):
        text = str(value or "").strip().lower()
        if not text:
            return ""
        normalized = unicodedata.normalize("NFKD", text)
        return "".join(ch for ch in normalized if not unicodedata.combining(ch))

    def _csv_value(self, row, key):
        aliases = self._field_aliases().get(key, [key])
        for alias in aliases:
            if alias in row and str(row.get(alias) or "").strip():
                return str(row.get(alias)).strip()
        return ""

    def _parse_decimal(self, value, required=False):
        raw_value = str(value or "").strip()
        if not raw_value:
            if required:
                raise ValueError("La fila no incluye un valor numerico obligatorio.")
            return None
        sanitized = (
            raw_value.replace("$", "")
            .replace("mxn", "")
            .replace(" ", "")
            .replace(",", "")
            .strip()
        )
        try:
            return Decimal(sanitized)
        except InvalidOperation as exc:
            raise ValueError(f"Valor numerico invalido: {raw_value}") from exc

    def _parse_date(self, value):
        date_value = str(value or "").strip()
        if not date_value:
            return None
        for date_format in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
            try:
                return datetime.strptime(date_value, date_format).date()
            except ValueError:
                continue
        raise ValueError(f"Fecha invalida: {date_value}")

    def _map_choice(self, value, mapping, default):
        normalized = self._normalize_text(value)
        if not normalized:
            return default
        return mapping.get(normalized, default)

    @staticmethod
    def _field_aliases():
        return {
            "brand": ["brand", "marca"],
            "model_name": ["model_name", "modelo", "model"],
            "year_label": ["year_label", "anio", "año", "estilo"],
            "condition_score": ["condition_score", "condicion", "condition"],
            "provider": ["provider", "proveedor"],
            "description": ["description", "descripcion"],
            "notes": ["notes", "notas"],
            "price": ["price", "precio"],
            "purchase_date": ["purchase_date", "fecha_compra"],
            "status": ["status", "estado"],
            "sales_channel": ["sales_channel", "canal_venta", "canal"],
            "watch_cost": ["watch_cost", "costo_reloj"],
            "shipping_cost": ["shipping_cost", "costo_envio"],
            "maintenance_cost": ["maintenance_cost", "costo_mantenimiento"],
            "other_costs": ["other_costs", "otros_costos"],
            "payment_method": ["payment_method", "metodo_pago"],
            "source_account": ["source_account", "cuenta_origen"],
            "purchase_notes": ["purchase_notes", "notas_compra"],
        }

    @staticmethod
    def _status_map():
        return {
            "available": "available",
            "disponible": "available",
            "reserved": "reserved",
            "apartado": "reserved",
            "sold": "sold",
            "vendido": "sold",
        }

    @staticmethod
    def _sales_channel_map():
        return {
            "marketplace": "marketplace",
            "instagram": "instagram",
            "whatsapp": "whatsapp",
            "direct": "direct",
            "directo": "direct",
            "other": "other",
            "otro": "other",
        }

    @staticmethod
    def _payment_method_map():
        return {
            "cash": "cash",
            "efectivo": "cash",
            "transfer": "transfer",
            "transferencia": "transfer",
            "card": "card",
            "tarjeta": "card",
            "msi": "msi",
            "consignment": "consignment",
            "consigna": "consignment",
        }

    @staticmethod
    def _source_account_map():
        return {
            "cash": "cash",
            "efectivo": "cash",
            "bbva": "bbva",
            "credit": "credit",
            "credito": "credit",
            "amex": "amex",
        }
