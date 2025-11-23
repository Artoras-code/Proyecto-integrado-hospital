from django.db import models
from django.conf import settings 
from django.core.validators import MinValueValidator, MaxValueValidator

class TipoParto(models.Model):
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre del Tipo de Parto")
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class TipoAnalgesia(models.Model):
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre del Tipo de Analgesia")
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre


class Madre(models.Model):
    rut = models.CharField(max_length=12, unique=True, verbose_name="RUT", db_index=True)
    nombre = models.CharField(max_length=255, verbose_name="Nombre Completo")
    fecha_nacimiento = models.DateField(verbose_name="Fecha de Nacimiento")
    direccion = models.CharField(max_length=255, blank=True, null=True, verbose_name="Dirección")
    telefono = models.CharField(max_length=15, blank=True, null=True, verbose_name="Teléfono")
    nacionalidad = models.CharField(max_length=100, blank=True, null=True)
    pertenece_pueblo_originario = models.BooleanField(default=False, verbose_name="Pertenece a Pueblo Originario")
    fecha_alta = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Alta")
    fallecida = models.BooleanField(default=False, verbose_name="Fallecida")
    fecha_fallecimiento = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Fallecimiento")
    responsable_medico = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, blank=True, 
        related_name="altas_madres",
        verbose_name="Médico Responsable (Alta/Defunción)"
    )

    def __str__(self):
        return f"{self.nombre} ({self.rut})"

    class Meta:
        verbose_name = "Madre"
        verbose_name_plural = "Madres"


class RegistroParto(models.Model):
    madre = models.ForeignKey(Madre, on_delete=models.CASCADE, related_name="partos", verbose_name="Madre")
    registrado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, blank=True,
        verbose_name="Registrado por"
    )
    
    fecha_parto = models.DateTimeField(verbose_name="Fecha y Hora del Parto", db_index=True)
    edad_gestacional_semanas = models.PositiveSmallIntegerField(verbose_name="Edad Gestacional (Semanas)")
    personal_atiende = models.CharField(max_length=255, blank=True, verbose_name="Personal que Atiende")

    tipo_parto = models.ForeignKey(
        TipoParto, 
        on_delete=models.SET_NULL, 
        null=True, blank=True,
        verbose_name="Tipo de Parto"
    )
    tipo_analgesia = models.ForeignKey(
        TipoAnalgesia,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name="Tipo de Analgesia"
    )
    
    complicaciones_texto = models.TextField(blank=True, null=True, verbose_name="Complicaciones (descripción)")
    uso_oxitocina = models.BooleanField(default=False, verbose_name="Uso de Oxitocina Profiláctica")
    ligadura_tardia_cordon = models.BooleanField(default=False, verbose_name="Ligadura Tardía de Cordón (>60s)")
    contacto_piel_a_piel = models.BooleanField(default=False, verbose_name="Contacto Piel a Piel")

    def __str__(self):
        fecha_str = self.fecha_parto.strftime('%Y-%m-%d') if self.fecha_parto else 'Sin fecha'
        return f"Parto de {self.madre.rut} el {fecha_str}"

    class Meta:
        verbose_name = "Registro de Parto"
        verbose_name_plural = "Registros de Partos"
        ordering = ['-fecha_parto'] 


class RecienNacido(models.Model):
    SEXO_CHOICES = (
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('I', 'Indeterminado'),
    )


    REANIMACION_CHOICES = (
        ('ninguna', 'Ninguna'),
        ('basica', 'Básica (Estimulación, Aspiración)'),
        ('avanzada', 'Avanzada (Ventilación, Masaje, Drogas)'),
    )

    ALIMENTACION_CHOICES = (
        ('LME', 'Lactancia Materna Exclusiva'),
        ('LMixta', 'Lactancia Mixta'),
        ('Formula', 'Fórmula Artificial'),
    )

    parto_asociado = models.ForeignKey(RegistroParto, on_delete=models.CASCADE, related_name="recien_nacidos")
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, verbose_name="Sexo")
    peso_grs = models.PositiveSmallIntegerField(verbose_name="Peso (gramos)")
    talla_cm = models.DecimalField(max_digits=4, decimal_places=1, verbose_name="Talla (cm)")
    
    apgar_1_min = models.PositiveSmallIntegerField(
        verbose_name="APGAR al Minuto",
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    apgar_5_min = models.PositiveSmallIntegerField(
        verbose_name="APGAR a los 5 Minutos",
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    
    profilaxis_ocular = models.BooleanField(default=True, verbose_name="Profilaxis Ocular")
    vacuna_hepatitis_b = models.BooleanField(default=True, verbose_name="Vacuna Hepatitis B")


    reanimacion = models.CharField(
        max_length=20, 
        choices=REANIMACION_CHOICES, 
        default='ninguna',
        verbose_name="Reanimación Neonatal"
    )
    anomalia_congenita = models.BooleanField(
        default=False, 
        verbose_name="Presenta Anomalía Congénita"
    )
    alimentacion_alta = models.CharField(
        max_length=20,
        choices=ALIMENTACION_CHOICES,
        default='LME',
        verbose_name="Alimentación al Alta"
    )
    
    fecha_alta = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Alta")
    alta_validada = models.BooleanField(default=False, verbose_name="Alta Validada (Supervisor)")
    fallecido = models.BooleanField(default=False, verbose_name="Fallecido")
    fecha_fallecimiento = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Fallecimiento")
    responsable_medico = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, blank=True, 
        related_name="altas_rn",
        verbose_name="Médico Responsable (Alta/Defunción)"
    )


    def __str__(self):
        return f"RN de {self.parto_asociado.madre.rut} ({self.peso_grs}g)"

    class Meta:
        verbose_name = "Recién Nacido"
        verbose_name_plural = "Recién Nacidos"


class SolicitudCorreccion(models.Model):
    ESTADO_CHOICES = (
        ('pendiente', 'Pendiente'),
        ('resuelta', 'Resuelta'),
    )
    
    registro = models.ForeignKey(RegistroParto, on_delete=models.CASCADE, related_name="solicitudes_correccion")
    solicitado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="solicitudes_creadas")
    resuelta_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="solicitudes_resueltas")
    mensaje = models.TextField(blank=True, null=True, verbose_name="Mensaje del solicitante")
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='pendiente')
    timestamp_creacion = models.DateTimeField(auto_now_add=True)
    timestamp_resolucion = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        solicitado_por_username = self.solicitado_por.username if self.solicitado_por else 'Usuario desconocido'
        return f"Solicitud de {solicitado_por_username} para Registro ID {self.registro.id}"
        
    class Meta:
        verbose_name = "Solicitud de Corrección"
        verbose_name_plural = "Solicitudes de Corrección"
        ordering = ['-timestamp_creacion']