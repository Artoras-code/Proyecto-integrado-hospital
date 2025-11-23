from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ADMIN = 'admin'
    SUPERVISOR = 'supervisor'
    DOCTOR = 'doctor'
    ENFERMERO = 'enfermero'

    ROL_CHOICES = (
        (ADMIN, 'Administrador'),
        (SUPERVISOR, 'Supervisor'),
        (DOCTOR, 'Doctor'),
        (ENFERMERO, 'Enfermero'),
    )
    rol = models.CharField(max_length=10, choices=ROL_CHOICES, default=ENFERMERO)
    rut = models.CharField(max_length=12, unique=True, null=True, blank=True, verbose_name='RUT')

    def __str__(self):
        return f"({self.username} {self.get_rol_display()})"


class SolicitudClave(models.Model):
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='solicitudes_clave')
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    resuelta = models.BooleanField(default=False)

    def __str__(self):
        return f"Solicitud de {self.usuario.username} - {self.fecha_solicitud}"

class Equipo(models.Model):
    TURNO_CHOICES = (
        ('diurno', 'Turno Diurno'),
        ('nocturno', 'Turno Nocturno'),
    )
    nombre = models.CharField(max_length=100, verbose_name="Nombre del Equipo")
    lider = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="equipos_liderados", verbose_name="Doctor Líder")
    miembros = models.ManyToManyField(CustomUser, related_name="equipos_asignados", verbose_name="Miembros del Equipo")
    turno = models.CharField(max_length=10, choices=TURNO_CHOICES, default='diurno')
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.get_turno_display()}) - Dr/a. {self.lider.username}"