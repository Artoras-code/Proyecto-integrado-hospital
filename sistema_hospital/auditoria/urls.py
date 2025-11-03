from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views

router = DefaultRouter()
router.register(r'sesiones', api_views.HistorialSesionViewSet, basename='sesion')
router.register(r'acciones', api_views.HistorialAccionViewSet, basename='accion')

app_name = 'auditoria'

urlpatterns = [
    path('api/', include(router.urls)),
]