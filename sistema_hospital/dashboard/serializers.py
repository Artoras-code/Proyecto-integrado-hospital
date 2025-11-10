from rest_framework import serializers
from .models import (
    TipoParto, TipoAnalgesia, ComplicacionParto, 
    Madre, RegistroParto, RecienNacido,
    SolicitudCorreccion # <-- 1. IMPORTAR NUEVO MODELO
)
# --- 2. IMPORTAR SERIALIZER DE USUARIO ---
from auditoria.serializers import SimpleUserSerializer

# --- SERIALIZERS DE PARÁMETROS (Ya existentes) ---
class TipoPartoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoParto
        fields = ['id', 'nombre', 'activo']

class TipoAnalgesiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoAnalgesia
        fields = ['id', 'nombre', 'activo']

class ComplicacionPartoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplicacionParto
        fields = ['id', 'nombre', 'activo']


# --- NUEVOS SERIALIZERS DE REGISTRO CLÍNICO ---

class MadreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Madre
        fields = '__all__'

class RecienNacidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecienNacido
        fields = '__all__'

# Serializer para CREAR/ACTUALIZAR Registros de Parto
# Acepta IDs para las relaciones (ej. "madre": 1)
class RegistroPartoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroParto
        fields = '__all__' 

# Serializer para LEER Registros de Parto
# Muestra los detalles de las relaciones (más útil para el frontend)
class RegistroPartoReadSerializer(serializers.ModelSerializer):
    madre = MadreSerializer(read_only=True)
    tipo_parto = TipoPartoSerializer(read_only=True)
    tipo_analgesia = TipoAnalgesiaSerializer(read_only=True)
    complicaciones = ComplicacionPartoSerializer(many=True, read_only=True)
    recien_nacidos = RecienNacidoSerializer(many=True, read_only=True) # Muestra los bebés anidados

    class Meta:
        model = RegistroParto
        fields = [
            'id', 'fecha_parto', 'edad_gestacional_semanas', 'personal_atiende',
            'uso_oxitocina', 'ligadura_tardia_cordon', 'contacto_piel_a_piel',
            'madre', 'registrado_por', 'tipo_parto', 'tipo_analgesia', 
            'complicaciones', 'recien_nacidos'
        ]


# --- 3. AÑADIR NUEVO SERIALIZER PARA SOLICITUDES ---

class SolicitudCorreccionSerializer(serializers.ModelSerializer):
    # Usamos el SimpleUserSerializer para ver los detalles del usuario
    solicitado_por = SimpleUserSerializer(read_only=True)
    resuelta_por = SimpleUserSerializer(read_only=True)
    
    # Opcional: Si quisiéramos ver el registro completo anidado
    # registro = RegistroPartoReadSerializer(read_only=True) 

    class Meta:
        model = SolicitudCorreccion
        fields = [
            'id', 'registro', 'solicitado_por', 'resuelta_por', 
            'mensaje', 'estado', 'timestamp_creacion', 'timestamp_resolucion'
        ]
        # Campos que el clínico NO puede escribir al crear
        read_only_fields = (
            'solicitado_por', 'resuelta_por', 'estado', 
            'timestamp_creacion', 'timestamp_resolucion'
        )