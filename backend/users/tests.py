from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework.views import APIView


class TestAuthApi(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="ivan",
            password="Secret123!",
            email="ivan@example.com",
            first_name="Ivan",
            last_name="R"
        )

    def test_login_returns_access_and_refresh_tokens(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "ivan", "password": "Secret123!"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_rejects_invalid_credentials(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "ivan", "password": "bad-password"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_refresh_returns_new_access_token(self):
        login_response = self.client.post(
            "/api/auth/login/",
            {"username": "ivan", "password": "Secret123!"},
            format="json",
        )

        response = self.client.post(
            "/api/auth/refresh/",
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_me_returns_authenticated_user_data(self):
        login_response = self.client.post(
            "/api/auth/login/",
            {"username": "ivan", "password": "Secret123!"},
            format="json",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}"
        )

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "ivan")
        self.assertEqual(response.data["email"], "ivan@example.com")

    def test_me_requires_authentication(self):
        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, 401)

    def test_default_permission_is_authenticated_for_unannotated_view(self):
        class ProtectedProbeView(APIView):
            def get(self, request):
                return Response({"ok": True})

        factory = APIRequestFactory()
        request = factory.get("/protected-probe/")
        response = ProtectedProbeView.as_view()(request)

        self.assertEqual(response.status_code, 401)

    def test_explicit_authenticated_view_still_requires_token(self):
        class ExplicitProtectedView(APIView):
            permission_classes = [IsAuthenticated]

            def get(self, request):
                return Response({"ok": True})

        factory = APIRequestFactory()
        request = factory.get("/explicit-protected/")
        response = ExplicitProtectedView.as_view()(request)

        self.assertEqual(response.status_code, 401)
