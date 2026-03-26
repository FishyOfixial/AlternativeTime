from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Client


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

    def test_create_client(self):
        payload = {
            "name": "Acme Corp",
            "phone": "555-111-2222",
            "email": "contact@acme.test",
            "address": "Industrial Ave 101",
        }

        response = self.client.post("/api/clients/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Client.objects.count(), 1)
        self.assertEqual(Client.objects.first().name, "Acme Corp")

    def test_list_clients(self):
        Client.objects.create(
            name="Example Client",
            phone="555-999-8888",
            email="example@test.com",
        )

        response = self.client.get("/api/clients/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_update_client(self):
        client = Client.objects.create(
            name="Old Name",
            phone="555-123",
            email="old@test.com",
        )

        response = self.client.patch(
            f"/api/clients/{client.id}/",
            {"name": "New Name", "is_active": False},
            format="json",
        )

        client.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(client.name, "New Name")
        self.assertFalse(client.is_active)

    def test_delete_client(self):
        client = Client.objects.create(
            name="Delete Me",
            phone="555-000",
        )

        response = self.client.delete(f"/api/clients/{client.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Client.objects.filter(id=client.id).exists())
