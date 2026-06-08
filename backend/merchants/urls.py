from django.urls import path, include
from rest_framework.routers import DefaultRouter
from merchants.views import MerchantViewSet

router = DefaultRouter()
router.register('merchants', MerchantViewSet, basename='merchant')

urlpatterns = [
    path('', include(router.urls)),
]
