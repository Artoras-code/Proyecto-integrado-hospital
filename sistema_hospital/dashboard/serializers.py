from rest_framework import serializers
from .models import (
    TipoParto, TipoAnalgesia,
    Madre, RegistroParto, RecienNacido,
    SolicitudCorreccion 
)
from auditoria.serializers import SimpleUserSerializer


class TipoPartoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoParto
        fields = '__all__'

class TipoAnalgesiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoAnalgesia
        fields = '__all__'
# -------------------------------------------------------

class MadreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Madre
        fields = '__all__'

class RecienNacidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecienNacido
        fields = '__all__'


class RegistroPartoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroParto
        fields = '__all__' 


class MisRegistrosWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroParto
        exclude = ('registrado_por',) 


class RegistroPartoReadSerializer(serializers.ModelSerializer):
    madre = MadreSerializer(read_only=True)
    tipo_parto = serializers.StringRelatedField(read_only=True)
    tipo_analgesia = serializers.StringRelatedField(read_only=True)
    registrado_por = SimpleUserSerializer(read_only=True)

    recien_nacidos = RecienNacidoSerializer(many=True, read_only=True) 

    class Meta:
        model = RegistroParto
        fields = [
            'id', 'fecha_parto', 'edad_gestacional_semanas', 'personal_atiende',
            'uso_oxitocina', 'ligadura_tardia_cordon', 'contacto_piel_a_piel',
            'madre', 'registrado_por', 'tipo_parto', 'tipo_analgesia', 
            'complicaciones_texto',
            'recien_nacidos'
        ]


class SolicitudCorreccionSerializer(serializers.ModelSerializer):
    solicitado_por = SimpleUserSerializer(read_only=True)
    resuelta_por = SimpleUserSerializer(read_only=True)
    
    class Meta:
        model = SolicitudCorreccion
        fields = [
            'id', 'registro', 'solicitado_por', 'resuelta_por', 
            'mensaje', 'estado', 'timestamp_creacion', 'timestamp_resolucion'
        ]
        read_only_fields = (
            'solicitado_por', 'resuelta_por', 'estado', 
            'timestamp_creacion', 'timestamp_resolucion'
        )