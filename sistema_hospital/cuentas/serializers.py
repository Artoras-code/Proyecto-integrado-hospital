from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Equipo, SolicitudClave

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'rol', 'rut', 'password', 'is_active'] # Asegúrate de que is_active esté aquí
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class UserOptionSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'nombre_completo', 'rol']
    def get_nombre_completo(self, obj):
        nombre = f"{obj.first_name} {obj.last_name}".strip()
        return nombre if nombre else obj.username

class EquipoSerializer(serializers.ModelSerializer):
    lider_nombre = serializers.CharField(source='lider.get_full_name', read_only=True)
    miembros = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.filter(rol='enfermero'), write_only=True)
    miembros_detalles = UserOptionSerializer(source='miembros', many=True, read_only=True)
    class Meta:
        model = Equipo
        fields = ['id', 'nombre', 'lider', 'lider_nombre', 'miembros', 'miembros_detalles', 'turno', 'activo', 'created_at']
        read_only_fields = ('lider', 'created_at')

class SolicitudClaveSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    class Meta:
        model = SolicitudClave
        fields = ['id', 'usuario', 'usuario_nombre', 'fecha_solicitud', 'resuelta']