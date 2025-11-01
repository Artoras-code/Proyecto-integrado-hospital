from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    
    ADMIN = 'admin'
    SUPERVISOR = 'supervisor'
    DOCTOR = 'doctor'
    ENFERMERO = 'enfermero'
    #USUARIO = 'usuario'
    
    ROL_CHOICES = (
        (ADMIN, 'Administrador'),
        #(USUARIO, 'Usuario'),
        (SUPERVISOR, 'Supervisor'),
        (DOCTOR, 'Doctor'),
        (ENFERMERO, 'Enfermero'),
    )
    rol = models.CharField(max_length=10, choices=ROL_CHOICES, default=ENFERMERO)

    rut = models.CharField(max_length=12, unique=True, null=True, blank=True, verbose_name='RUT')

    def __str__(self):
        return f"({self.username} {self.get_rol_display()})"