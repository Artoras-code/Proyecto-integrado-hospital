from django.contrib.contenttypes.models import ContentType
from .models import HistorialAccion

class AuditoriaMixin:
    def registrar_accion(self, instance, accion, detalles=""):
        try:
            HistorialAccion.objects.create(
                usuario=self.request.user,
                accion=accion,
                objeto_afectado=instance,
                detalles=detalles or f"Acción {accion} realizada sobre {instance}"
            )
        except Exception as e:
            print(f"Error generando auditoría: {e}")

    def perform_create(self, serializer):
        instance = serializer.save()
        self.registrar_accion(instance, 'creacion')

    def perform_update(self, serializer):
        instance = serializer.save()
        self.registrar_accion(instance, 'modificacion')

    def perform_destroy(self, instance):
        content_type = ContentType.objects.get_for_model(instance)
        object_id = instance.pk
        str_repr = str(instance)

        instance.delete()

        HistorialAccion.objects.create(
            usuario=self.request.user,
            accion='eliminacion',
            content_type=content_type,
            object_id=object_id,
            detalles=f"Eliminó el registro: {str_repr}"
        )