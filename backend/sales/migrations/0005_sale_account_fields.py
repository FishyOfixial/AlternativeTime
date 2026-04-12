from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("sales", "0004_recalculate_sale_profit_percentage"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE sales_sale "
                        "ADD COLUMN extras_account varchar(20) NOT NULL DEFAULT 'cash';"
                    ),
                    reverse_sql=migrations.RunSQL.noop,
                ),
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE sales_sale "
                        "ADD COLUMN sale_shipping_account varchar(20) NOT NULL DEFAULT 'cash';"
                    ),
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="sale",
                    name="extras_account",
                    field=models.CharField(
                        choices=[
                            ("cash", "Efectivo"),
                            ("bbva", "BBVA"),
                            ("credit", "Credito"),
                            ("amex", "Amex"),
                        ],
                        default="cash",
                        max_length=20,
                    ),
                ),
                migrations.AddField(
                    model_name="sale",
                    name="sale_shipping_account",
                    field=models.CharField(
                        choices=[
                            ("cash", "Efectivo"),
                            ("bbva", "BBVA"),
                            ("credit", "Credito"),
                            ("amex", "Amex"),
                        ],
                        default="cash",
                        max_length=20,
                    ),
                ),
            ],
        ),
    ]
