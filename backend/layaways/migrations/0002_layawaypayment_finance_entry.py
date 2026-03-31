from django.db import migrations, models
import django.db.models.deletion


def link_existing_layaway_finance_entries(apps, schema_editor):
    LayawayPayment = apps.get_model("layaways", "LayawayPayment")
    FinanceEntry = apps.get_model("finance", "FinanceEntry")

    used_entry_ids = set(
        LayawayPayment.objects.using(schema_editor.connection.alias)
        .exclude(finance_entry_id__isnull=True)
        .values_list("finance_entry_id", flat=True)
    )

    payments = LayawayPayment.objects.using(schema_editor.connection.alias).select_related("layaway")

    for payment in payments:
        if payment.finance_entry_id:
            continue

        candidate = (
            FinanceEntry.all_objects.using(schema_editor.connection.alias)
            .filter(
                concept="layaway_payment",
                product_id=payment.layaway.product_id,
                entry_date=payment.payment_date,
                amount=payment.amount,
                account=payment.account,
            )
            .exclude(id__in=used_entry_ids)
            .order_by("created_at", "id")
            .first()
        )

        if candidate is None:
            continue

        payment.finance_entry_id = candidate.id
        payment.save(update_fields=["finance_entry"])
        used_entry_ids.add(candidate.id)


class Migration(migrations.Migration):

    dependencies = [
        ("finance", "0004_alter_financeentry_concept"),
        ("layaways", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="layawaypayment",
            name="finance_entry",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="layaway_payment",
                to="finance.financeentry",
            ),
        ),
        migrations.RunPython(link_existing_layaway_finance_entries, migrations.RunPython.noop),
    ]
