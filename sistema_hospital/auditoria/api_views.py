from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import HistorialSesion, HistorialAccion
from .serializers import HistorialSesionSerializer, HistorialAccionSerializer

class HistorialSesionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para que los administradores vean el historial de sesiones.
    """
    queryset = HistorialSesion.objects.all().order_by('-timestamp')
    serializer_class = HistorialSesionSerializer
    permission_classes = [IsAdminUser]

class HistorialAccionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para que los administradores vean el historial de acciones (CRUD).
    """
    queryset = HistorialAccion.objects.all().order_by('-timestamp')
    serializer_class = HistorialAccionSerializer
    permission_classes = [IsAdminUser]