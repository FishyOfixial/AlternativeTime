from rest_framework.routers import DefaultRouter

from .views import LayawayViewSet

router = DefaultRouter()
router.register("", LayawayViewSet, basename="layaway")

urlpatterns = router.urls
