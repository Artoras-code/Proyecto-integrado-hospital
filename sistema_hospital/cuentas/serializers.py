from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        # Definimos los campos que la API mostrará/recibirá
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'rol', 'rut', 'is_active', 'password']
        # Hacemos que la contraseña sea de "solo escritura" (no se puede leer)
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        # Hasheamos la contraseña antes de guardarla
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Si se envía una contraseña nueva, la hasheamos
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)