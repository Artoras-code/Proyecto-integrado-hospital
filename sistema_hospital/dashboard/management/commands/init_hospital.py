from django.core.management.base import BaseCommand
from dashboard.models import TipoParto, TipoAnalgesia

class Command(BaseCommand):
    help = 'Carga datos maestros realistas (Tipos de Parto y Analgesia) con IDs fijos'

    def handle(self, *args, **kwargs):
        self.stdout.write("Iniciando carga de datos clínicos...")

        partos_data = [
            (1, "Parto Vaginal Espontáneo"),
            (2, "Parto Vaginal Instrumental (Fórceps)"),
            (3, "Parto Vaginal Instrumental (Vacuum)"),
            (4, "Cesárea Electiva"),
            (5, "Cesárea de Urgencia"),
        ]

        for pk, nombre in partos_data:
            TipoParto.objects.update_or_create(
                id=pk, 
                defaults={'nombre': nombre, 'activo': True}
            )

        analgesias_data = [
            (1, "Regional: Epidural"),
            (2, "Regional: Espinal (Raquídea)"),
            (3, "Regional: Combinada"),
            (4, "Anestesia General"),
            (5, "Inhalatoria (Óxido Nitroso)"),
            (6, "Sin Analgesia (Manejo no farmacológico)"),
        ]

        for pk, nombre in analgesias_data:
            TipoAnalgesia.objects.update_or_create(
                id=pk,
                defaults={'nombre': nombre, 'activo': True}
            )

        self.stdout.write(self.style.SUCCESS('¡Datos clínicos cargados exitosamente!'))