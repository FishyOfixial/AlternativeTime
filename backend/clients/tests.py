from decimal import Decimal
from datetime import date

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.management import call_command
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from inventory.models import InventoryItem, PurchaseCost
from sales.models import Sale

from .models import Client
from .services import send_birthday_notifications


class TestClientsApi(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="clients-user",
            password="Secret123!",
        )
        self.client.force_authenticate(user=self.user)

    def test_list_clients_requires_authenticated_request(self):
        unauthenticated_client = APIClient()

        response = unauthenticated_client.get("/api/clients/")

        self.assertEqual(response.status_code, 401)

    def test_create_client_rejects_duplicate_phone(self):
        Client.objects.create(name="Existing", phone="555-111-2222")

        response = self.client.post(
            "/api/clients/",
            {
                "name": "Acme Corp",
                "phone": "555-111-2222",
                "instagram_handle": "@acme",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("phone", response.data)

    def test_create_client_assigns_authenticated_user_as_owner(self):
        response = self.client.post(
            "/api/clients/",
            {
                "name": "Owned Client",
                "birth_date": "1990-06-02",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        client = Client.objects.get(id=response.data["id"])
        self.assertEqual(client.created_by, self.user)
        self.assertEqual(client.updated_by, self.user)

    def test_retrieve_client_includes_purchase_history(self):
        client = Client.objects.create(
            name="Repeat Buyer",
            phone="555-4444",
            instagram_handle="@repeatbuyer",
        )
        item = InventoryItem.objects.create(
            brand="Classic",
            model_name="Watch",
            name="Classic Watch",
            product_id="CLA-001",
            sku="CLA-001",
            price=Decimal("1550.00"),
            purchase_date=timezone.localdate(),
            status="sold",
            sold_date=timezone.localdate(),
            days_to_sell=0,
            stock=0,
            is_active=False,
        )
        PurchaseCost.objects.create(
            product=item,
            purchase_date=item.purchase_date,
            watch_cost=Decimal("1000.00"),
            shipping_cost=Decimal("0.00"),
            maintenance_cost=Decimal("0.00"),
            other_costs=Decimal("0.00"),
        )
        Sale.objects.create(
            client=client,
            product=item,
            sale_date=timezone.localdate(),
            payment_method="cash",
            sales_channel="direct",
            amount_paid=Decimal("1550.00"),
            cost_snapshot=Decimal("1000.00"),
            gross_profit=Decimal("550.00"),
            created_by=self.user,
            updated_by=self.user,
        )

        response = self.client.get(f"/api/clients/{client.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["instagram_handle"], "@repeatbuyer")
        self.assertEqual(response.data["purchases_count"], 1)
        self.assertEqual(response.data["total_spent"], "1550")
        self.assertEqual(len(response.data["purchase_history"]), 1)
        self.assertEqual(response.data["purchase_history"][0]["item_names"], ["Classic Watch"])


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="Alternative Time <no-reply@example.com>",
    ALTERNATIVE_TIME_BUSINESS_NAME="Alternative Time",
    BIRTHDAY_NOTIFICATION_TO_EMAILS=["alerts@example.com"],
)
class TestBirthdayNotifications(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username="owner",
            email="owner@example.com",
            password="Secret123!",
            first_name="Ivan",
        )
        self.other_owner = user_model.objects.create_user(
            username="other-owner",
            email="other@example.com",
            password="Secret123!",
        )

    def test_send_birthday_notifications_sends_one_email_with_contact_details(self):
        today = date(2026, 6, 2)
        Client.objects.create(
            name="Juan Perez",
            birth_date=today,
            instagram_handle="@juan",
            phone="555-111-2222",
            created_by=self.owner,
        )
        Client.objects.create(
            name="Maria Lopez",
            birth_date=date(1990, 6, 2),
            instagram_handle="@maria",
            created_by=self.owner,
        )
        Client.objects.create(
            name="Carlos Rodriguez",
            birth_date=today,
            phone="555-333-4444",
            created_by=self.other_owner,
        )
        Client.objects.create(name="No Birthday", birth_date=date(1990, 6, 3), created_by=self.owner)
        Client.objects.create(name="No Date", created_by=self.owner)

        result = send_birthday_notifications(today=today)

        self.assertEqual(result.birthdays_found, 3)
        self.assertEqual(result.emails_sent, 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["alerts@example.com"])
        self.assertIn("Juan Perez - @juan - 555-111-2222", mail.outbox[0].body)
        self.assertIn("Maria Lopez - @maria", mail.outbox[0].body)
        self.assertIn("Carlos Rodriguez - 555-333-4444", mail.outbox[0].body)
        self.assertNotIn("No Birthday", mail.outbox[0].body)

    def test_send_birthday_notifications_does_not_send_without_birthdays(self):
        Client.objects.create(
            name="Tomorrow",
            birth_date=date(1990, 6, 3),
            created_by=self.owner,
        )

        result = send_birthday_notifications(today=date(2026, 6, 2))

        self.assertEqual(result.birthdays_found, 0)
        self.assertEqual(result.emails_sent, 0)
        self.assertEqual(getattr(mail, "outbox", []), [])

    @override_settings(BIRTHDAY_NOTIFICATION_TO_EMAILS=[])
    def test_send_birthday_notifications_does_not_send_without_recipient(self):
        Client.objects.create(
            name="No Recipient",
            birth_date=date(1990, 6, 2),
            created_by=self.owner,
        )

        result = send_birthday_notifications(today=date(2026, 6, 2))

        self.assertEqual(result.birthdays_found, 1)
        self.assertEqual(result.emails_sent, 0)
        self.assertEqual(len(result.errors), 1)
        self.assertEqual(getattr(mail, "outbox", []), [])

    @override_settings(BIRTHDAY_NOTIFICATION_TO_EMAILS=["alerts@example.com", "owner@example.com"])
    def test_send_birthday_notifications_supports_multiple_recipients(self):
        Client.objects.create(
            name="Multiple Recipients",
            birth_date=date(1990, 6, 2),
            created_by=self.owner,
        )

        result = send_birthday_notifications(today=date(2026, 6, 2))

        self.assertEqual(result.emails_sent, 1)
        self.assertEqual(mail.outbox[0].to, ["alerts@example.com", "owner@example.com"])

    def test_notify_birthdays_command_accepts_date_argument(self):
        Client.objects.create(
            name="Command Client",
            birth_date=date(1990, 6, 2),
            instagram_handle="@command",
            created_by=self.owner,
        )

        call_command("notify_birthdays", "--date", "2026-06-02")

        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Command Client - @command", mail.outbox[0].body)
