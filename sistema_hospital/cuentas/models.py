from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    
    ADMIN = 'admin'
    USUARIO = 'usuario'
    
    ROL_CHOICES = (
        (ADMIN, 'Administrador'),
        (USUARIO, 'Usuario'),
    )
    rol = models.CharField(max_length=10, choices=ROL_CHOICES, default=USUARIO)

    def __str__(self):
        return self.username