from django.test import TestCase
from rest_framework.test import APIClient


class TestHealthCheck(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check_is_public_and_returns_status_payload(self):
        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "ok")
        self.assertIn(response.data["database"], {"sqlite", "postgres"})
