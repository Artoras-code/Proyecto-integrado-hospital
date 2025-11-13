from django.contrib import admin
from .models import (
    TipoParto, 
    TipoAnalgesia, 
    Madre, 
    RegistroParto, 
    RecienNacido, 
    SolicitudCorreccion
)



@admin.register(TipoParto)
class TipoPartoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'activo')
    list_filter = ('activo',)
    search_fields = ('nombre',)

@admin.register(TipoAnalgesia)
class TipoAnalgesiaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'activo')
    list_filter = ('activo',)
    search_fields = ('nombre',)

@admin.register(Madre)
class MadreAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'rut', 'fecha_nacimiento', 'telefono')
    search_fields = ('nombre', 'rut')

@admin.register(RegistroParto)
class RegistroPartoAdmin(admin.ModelAdmin):
    list_display = ('id', 'madre', 'fecha_parto', 'tipo_parto', 'registrado_por')
    list_filter = ('tipo_parto', 'tipo_analgesia', 'fecha_parto')
    search_fields = ('madre__nombre', 'madre__rut')

@admin.register(RecienNacido)
class RecienNacidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'parto_asociado', 'sexo', 'peso_grs', 'talla_cm')
    list_filter = ('sexo',)
    search_fields = ('parto_asociado__madre__rut',)

@admin.register(SolicitudCorreccion)
class SolicitudCorreccionAdmin(admin.ModelAdmin):
    list_display = ('id', 'registro', 'solicitado_por', 'estado', 'timestamp_creacion')
    list_filter = ('estado',)
    search_fields = ('registro__madre__rut', 'solicitado_por__username')    