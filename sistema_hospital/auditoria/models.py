from django.db import models
from django.conf import settings # El settings se refiere al Usuario por defecto(CustomUSer)

# Create your models here.
class HistorialSesion(models.Model):
    ACCION_CHOICES = (
        ('login', 'Inicio de Sesión'),
        ('logout', 'Cierre de Sesión'),
    )

    # El settings.AUTH_USER_MODEL es con el que nos referimos al CustomUser
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    accion = models.CharField(max_length=10, choices=ACCION_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True) 
    # De bonus guardamos la ip del dispositivo(Sujeto a cambios en base a la opnion del equipo)

    def __str__(self):
        return f"{self.usuario} - {self.accion} - {self.timestamp}"

    class Meta:
        verbose_name = "Historial de Sesión"
        verbose_name_plural = "Historiales de Sesiones"


# Arriba es solo para el logeo y deslogeo del usuario
# Aqui van las modificaciones CRUD

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class HistorialAccion(models.Model):
    ACCION_CHOICES = (
        ('creacion', 'Creación'),
        ('modificacion', 'Modificación'),
        ('eliminacion', 'Eliminación'),
    )

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    accion = models.CharField(max_length=15, choices=ACCION_CHOICES)

    # Esto nos permite usar esta tabla para "Informes de Recien Nacido"
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    objeto_afectado = GenericForeignKey('content_type', 'object_id')
    
    # Un campo de texto para guardar qué cambió.
    # Se podrían guardar en un JSON. (No me hagan investigar mas atte: El encargado DB)
    detalles = models.TextField(blank=True, null=True, verbose_name="Detalles del cambio")

    def __str__(self):
        return f"{self.usuario} - {self.accion} en {self.content_type.model} (ID: {self.object_id})"

    class Meta:
        verbose_name = "Historial de Acción"
        verbose_name_plural = "Historiales de Acciones"