from rest_framework import serializers
from .models import HistorialSesion, HistorialAccion
from cuentas.models import CustomUser

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'rol']

class HistorialSesionSerializer(serializers.ModelSerializer):
    usuario = SimpleUserSerializer(read_only=True)
    
    class Meta:
        model = HistorialSesion
        fields = ['id', 'usuario', 'timestamp', 'accion', 'ip_address']

class HistorialAccionSerializer(serializers.ModelSerializer):
    usuario = SimpleUserSerializer(read_only=True)
    content_type_model = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = HistorialAccion
        fields = ['id', 'usuario', 'timestamp', 'accion', 'content_type_model', 'object_id', 'detalles']