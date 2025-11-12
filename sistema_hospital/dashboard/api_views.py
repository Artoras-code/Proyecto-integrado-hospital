from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from datetime import datetime
import pandas as pd
from io import BytesIO
from django.http import HttpResponse

from rest_framework.decorators import action, api_view, permission_classes
from django.utils import timezone
from auditoria.serializers import SimpleUserSerializer
from auditoria.mixins import AuditoriaMixin
from auditoria.models import HistorialAccion
from django.contrib.contenttypes.models import ContentType


# --- 1. ¡IMPORTACIÓN CORREGIDA! ---
# Eliminamos 'IsSupervisorOrReadOnlyClinico'
from cuentas.permissions import (
    IsSupervisorUser, 
    IsClinicoUser, 
    IsSupervisorOrClinicoCreateRead
)
# ---
        
# 2. Importar Modelos
from .models import (
    TipoParto, TipoAnalgesia,
    Madre, RegistroParto, RecienNacido,
    SolicitudCorreccion
)
# 3. ¡IMPORTACIÓN CORREGIDA!
from .serializers import (
    # Serializers de parámetros eliminados
    MadreSerializer, RecienNacidoSerializer, 
    RegistroPartoReadSerializer, RegistroPartoWriteSerializer,
    MisRegistrosWriteSerializer,
    SolicitudCorreccionSerializer
)
 
# --- VISTAS DE REGISTRO CLÍNICO ---

class MadreViewSet(AuditoriaMixin, viewsets.ModelViewSet):
    queryset = Madre.objects.all().order_by('nombre')
    serializer_class = MadreSerializer
    permission_classes = [IsAuthenticated, IsSupervisorOrClinicoCreateRead]

class RecienNacidoViewSet(AuditoriaMixin, viewsets.ModelViewSet):
    queryset = RecienNacido.objects.all().order_by('-parto_asociado__fecha_parto')
    serializer_class = RecienNacidoSerializer
    permission_classes = [IsAuthenticated, IsSupervisorOrClinicoCreateRead]

class RegistroPartoViewSet(AuditoriaMixin, viewsets.ModelViewSet):
    queryset = RegistroParto.objects.all().order_by('-fecha_parto')
    permission_classes = [IsAuthenticated, IsSupervisorUser] 

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return RegistroPartoReadSerializer
        return RegistroPartoWriteSerializer

# --- VISTA "MIS REGISTROS" (SOLO CLÍNICO) ---
class MisRegistrosViewSet(AuditoriaMixin,viewsets.ModelViewSet):
    serializer_class = RegistroPartoReadSerializer
    permission_classes = [IsAuthenticated, IsClinicoUser]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        return RegistroParto.objects.filter(registrado_por=user).order_by('-fecha_parto')
    
    # --- ¡MÉTODO ACTUALIZADO! ---
    def get_serializer_class(self):
        """
        Usa el serializer de lectura para 'list' y 'retrieve'.
        Usa el 'MisRegistrosWriteSerializer' para 'create'.
        """
        if self.action in ['list', 'retrieve']:
            return RegistroPartoReadSerializer
        
        # Ahora sí encontrará 'MisRegistrosWriteSerializer'
        return MisRegistrosWriteSerializer
    # ---

    def perform_create(self, serializer):
        instance = serializer.save(registrado_por=self.request.user)
        self.registrar_accion(instance, 'creacion', "Creó un registro desde 'Mis Registros'")

    @action(detail=True, methods=['post'], permission_classes=[IsClinicoUser])
    def solicitar_correccion(self, request, pk=None):
        registro = self.get_object() 
        mensaje = request.data.get('mensaje', '')
        
        if SolicitudCorreccion.objects.filter(registro=registro, estado='pendiente').exists():
            return Response(
                {"error": "Ya existe una solicitud pendiente para este registro."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        solicitud = SolicitudCorreccion.objects.create(
            registro=registro,
            solicitado_por=request.user,
            mensaje=mensaje
        )

        #registro de auditoria
        self.registrar_accion(
            instance=registro,
            accion='solicitud',
            detalles=f"Solicitó corrección: '{mensaje}'"
        )

        serializer = SolicitudCorreccionSerializer(solicitud)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# --- VIEWSET PARA NOTIFICACIONES DEL SUPERVISOR ---
# --- ¡NUEVO VIEWSET PARA NOTIFICACIONES DEL SUPERVISOR! ---
class SolicitudCorreccionViewSet(AuditoriaMixin, viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para que el Supervisor vea y gestione
    las solicitudes de corrección.
    """
    queryset = SolicitudCorreccion.objects.all().order_by('-timestamp_creacion')
    serializer_class = SolicitudCorreccionSerializer
    permission_classes = [IsAuthenticated, IsSupervisorUser] 

    def get_queryset(self):
        qs = super().get_queryset()
        estado = self.request.query_params.get('estado')
        if estado:
            return qs.filter(estado=estado)
        return qs

    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        solicitud = self.get_object()
        if solicitud.estado == 'pendiente':
            solicitud.estado = 'resuelta'
            solicitud.resuelta_por = request.user
            solicitud.timestamp_resolucion = timezone.now()
            solicitud.save()

            #Registro para auditoria
            self.registrar_accion(
                instance=solicitud.registro,
                accion='resolucion',
                detalles=f"Supervisor {request.user.username} marcó la solicitud como resuelta."
            )

            return Response(SolicitudCorreccionSerializer(solicitud).data)
        
        return Response(
            {"error": "Esta solicitud ya estaba resuelta."},
            status=status.HTTP_400_BAD_REQUEST
        )


# --- VISTAS DE REPORTES (SOLO SUPERVISOR) ---

class ReporteREMView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisorUser]

    def get(self, request, *args, **kwargs):
        # ... (lógica de fechas)
        fecha_inicio_str = request.query_params.get('fecha_inicio')
        fecha_fin_str = request.query_params.get('fecha_fin')
        if not fecha_inicio_str or not fecha_fin_str:
            return Response({"error": "Debe proporcionar 'fecha_inicio' y 'fecha_fin' (YYYY-MM-DD)."}, status=400)
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').replace(hour=0, minute=0, second=0)
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
        except ValueError:
            return Response({"error": "Formato de fecha inválido. Use YYYY-MM-DD."}, status=400)
            
        partos_en_rango = RegistroParto.objects.filter(fecha_parto__range=(fecha_inicio, fecha_fin))
        rn_en_rango = RecienNacido.objects.filter(parto_asociado__in=partos_en_rango)

        partos_por_tipo = partos_en_rango.values('tipo_parto__nombre').annotate(total=Count('id')).order_by('-total')
        
        pesos_rn = rn_en_rango.aggregate(
            menos_500g=Count('id', filter=Q(peso_grs__lt=500)),
            de_500_a_999g=Count('id', filter=Q(peso_grs__gte=500, peso_grs__lte=999)),
            de_1000_a_1499g=Count('id', filter=Q(peso_grs__gte=1000, peso_grs__lte=1499)),
            de_1500_a_1999g=Count('id', filter=Q(peso_grs__gte=1500, peso_grs__lte=1999)),
            de_2000_a_2499g=Count('id', filter=Q(peso_grs__gte=2000, peso_grs__lte=2499)),
            de_2500_a_2999g=Count('id', filter=Q(peso_grs__gte=2500, peso_grs__lte=2999)),
            de_3000_a_3999g=Count('id', filter=Q(peso_grs__gte=3000, peso_grs__lte=3999)),
            mas_4000g=Count('id', filter=Q(peso_grs__gte=4000)),
        )

        reporte = {
            "rango_fechas": {"inicio": fecha_inicio_str, "fin": fecha_fin_str},
            "total_partos": partos_en_rango.count(),
            "total_recien_nacidos": rn_en_rango.count(),
            "seccion_A_partos_por_tipo": list(partos_por_tipo),
            "seccion_D1_pesos_recien_nacidos": pesos_rn,
        }

        # Registro para auditoria
        try:
            HistorialAccion.objects.create(
                usuario=request.user,
                accion='reporte',
                # Como no hay un objeto "Reporte" real en la BD,
                # usamos al propio usuario como "objeto afectado" para cumplir con el modelo.
                content_type=ContentType.objects.get_for_model(request.user),
                object_id=request.user.id,
                detalles=f"Generó reporte REM consolidado para el rango: {fecha_inicio_str} a {fecha_fin_str}"
            )
        except Exception as e:
            print(f"Error auditoría reporte: {e}")

        return Response(reporte)


class ExportRegistrosExcelView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisorUser]

    def get(self, request, *args, **kwargs):
        # ... (lógica de fechas) ...
        fecha_inicio_str = request.query_params.get('fecha_inicio')
        fecha_fin_str = request.query_params.get('fecha_fin')
        if not fecha_inicio_str or not fecha_fin_str:
            return Response({"error": "Fechas son requeridas."}, status=400)
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').replace(hour=0, minute=0, second=0)
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
        except ValueError:
            return Response({"error": "Formato de fecha inválido."}, status=400)

        qs = RecienNacido.objects.filter(
            parto_asociado__fecha_parto__range=(fecha_inicio, fecha_fin)
        ).select_related(
            'parto_asociado__madre', 
            'parto_asociado__tipo_parto',
            'parto_asociado__tipo_analgesia'
        ).order_by('parto_asociado__fecha_parto')

        data = []
        for rn in qs:
            parto = rn.parto_asociado
            madre = parto.madre
            
            complicaciones_str = parto.complicaciones_texto or "Ninguna"
            
            data.append({
                "RUT Madre": madre.rut,
                "Nombre Madre": madre.nombre,
                "Fecha Parto": parto.fecha_parto.strftime('%Y-%m-%d %H:%M'),
                "Tipo Parto": parto.tipo_parto.nombre if parto.tipo_parto else 'N/A',
                "Sexo RN": rn.get_sexo_display(),
                "Peso RN (grs)": rn.peso_grs,
                "Talla RN (cm)": rn.talla_cm,
                "APGAR 1'": rn.apgar_1_min,
                "APGAR 5'": rn.apgar_5_min,
                "Edad Gestacional (sem)": parto.edad_gestacional_semanas,
                "Analgesia": parto.tipo_analgesia.nombre if parto.tipo_analgesia else 'N/A',
                "Complicaciones": complicaciones_str,
                "Personal Atiende": parto.personal_atiende,
                "Contacto Piel a Piel": "Sí" if parto.contacto_piel_a_piel else "No",
                "Ligadura Tardía": "Sí" if parto.ligadura_tardia_cordon else "No",
            })

        if not data:
            return Response({"error": "No se encontraron datos en ese rango de fechas."}, status=404)
        
        df = pd.DataFrame(data)
        output_buffer = BytesIO()
        with pd.ExcelWriter(output_buffer, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Registros_Partos', index=False)
        output_buffer.seek(0)

        response = HttpResponse(
            output_buffer.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = f"attachment; filename=reporte_partos_{fecha_inicio_str}_al_{fecha_fin_str}.xlsx"
        return response

# --- VISTA DE STATS DEL DASHBOARD DEL SUPERVISOR ---
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSupervisorUser])
def supervisor_dashboard_stats(request):
    """
    API endpoint para obtener las estadísticas del dashboard del Supervisor.
    """
    pending_corrections_count = SolicitudCorreccion.objects.filter(estado='pendiente').count()
    
    today = timezone.now()
    registros_this_month = RegistroParto.objects.filter(
        fecha_parto__year=today.year, 
        fecha_parto__month=today.month
    ).count()

    latest_pending_corrections = SolicitudCorreccion.objects.filter(estado='pendiente') \
                                .select_related('solicitado_por', 'registro') \
                                .order_by('-timestamp_creacion')[:5]

    formatted_corrections = [
        {
            'id': s.id,
            'registro_id': s.registro.id,
            'solicitado_por': s.solicitado_por.username if s.solicitado_por else 'N/A',
            'mensaje': s.mensaje,
            'timestamp': timezone.localtime(s.timestamp_creacion).strftime('%Y-%m-%d %H:%M'),
        } for s in latest_pending_corrections
    ]

    data = {
        'pending_corrections_count': pending_corrections_count,
        'registros_this_month': registros_this_month,
        'latest_pending_corrections': formatted_corrections,
    }
    return Response(data, status=status.HTTP_200_OK)