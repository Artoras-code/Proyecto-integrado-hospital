from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from datetime import datetime
import pandas as pd
from io import BytesIO
from django.http import HttpResponse

# --- 1. Importar TODOS los permisos ---
from cuentas.permissions import (
    IsSupervisorUser, 
    IsClinicoUser, 
    IsSupervisorOrReadOnlyClinico,
    IsSupervisorOrClinicoCreateRead
)
        
# 2. Importar TODOS los modelos y serializers
from .models import (
    TipoParto, TipoAnalgesia, ComplicacionParto, 
    Madre, RegistroParto, RecienNacido
)
from .serializers import (
    TipoPartoSerializer, TipoAnalgesiaSerializer, ComplicacionPartoSerializer,
    MadreSerializer, RecienNacidoSerializer, 
    RegistroPartoReadSerializer, RegistroPartoWriteSerializer
)

# --- VISTAS DE PARÁMETROS (Supervisor=CRUD, Clínico=Lectura) ---
class TipoPartoViewSet(viewsets.ModelViewSet):
    queryset = TipoParto.objects.all().order_by('nombre')
    serializer_class = TipoPartoSerializer
    # --- 3. CAMBIADO ---
    permission_classes = [IsAuthenticated, IsSupervisorOrReadOnlyClinico]

class TipoAnalgesiaViewSet(viewsets.ModelViewSet):
    queryset = TipoAnalgesia.objects.all().order_by('nombre')
    serializer_class = TipoAnalgesiaSerializer
    # --- 4. CAMBIADO ---
    permission_classes = [IsAuthenticated, IsSupervisorOrReadOnlyClinico]

class ComplicacionPartoViewSet(viewsets.ModelViewSet):
    queryset = ComplicacionParto.objects.all().order_by('nombre')
    serializer_class = ComplicacionPartoSerializer
    # --- 5. CAMBIADO ---
    permission_classes = [IsAuthenticated, IsSupervisorOrReadOnlyClinico]
    
# --- VISTAS DE REGISTRO CLÍNICO ---

class MadreViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar Madres (Pacientes).
    Supervisor: CRUD
    Clínico: CR (Crear y Leer)
    """
    queryset = Madre.objects.all().order_by('nombre')
    serializer_class = MadreSerializer
    # --- 6. CAMBIADO ---
    permission_classes = [IsAuthenticated, IsSupervisorOrClinicoCreateRead]

class RecienNacidoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar Recién Nacidos.
    Supervisor: CRUD
    Clínico: CR (Crear y Leer)
    """
    queryset = RecienNacido.objects.all().order_by('-parto_asociado__fecha_parto')
    serializer_class = RecienNacidoSerializer
    # --- 7. CAMBIADO ---
    permission_classes = [IsAuthenticated, IsSupervisorOrClinicoCreateRead]

class RegistroPartoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar TODOS los eventos de Parto.
    SOLO SUPERVISOR.
    """
    queryset = RegistroParto.objects.all().order_by('-fecha_parto')
    permission_classes = [IsAuthenticated, IsSupervisorUser] # <-- Solo Supervisor

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return RegistroPartoReadSerializer
        return RegistroPartoWriteSerializer

# --- VISTA "MIS REGISTROS" (SOLO CLÍNICO) ---
class MisRegistrosViewSet(viewsets.ModelViewSet):
    """
    API endpoint para que el personal clínico (Doctor/Enfermero) vea y edite
    ÚNICAMENTE sus propios registros de parto.
    """
    serializer_class = RegistroPartoReadSerializer
    permission_classes = [IsAuthenticated, IsClinicoUser] # <-- Solo Clínico

    def get_queryset(self):
        """
        Filtra solo los registros creados por el usuario actual.
        """
        user = self.request.user
        return RegistroParto.objects.filter(registrado_por=user).order_by('-fecha_parto')
    
    def get_serializer_class(self):
        """
        Usa el serializer de escritura para crear/actualizar.
        """
        if self.action in ['list', 'retrieve']:
            return RegistroPartoReadSerializer
        return RegistroPartoWriteSerializer

    def perform_create(self, serializer):
        """
        Asigna automáticamente el usuario actual como 'registrado_por'.
        """
        serializer.save(registrado_por=self.request.user)

# --- VISTAS DE REPORTES (SOLO SUPERVISOR) ---

class ReporteREMView(APIView):
    """
    API endpoint para generar el reporte consolidado REM BS22.
    SOLO SUPERVISOR.
    """
    permission_classes = [IsAuthenticated, IsSupervisorUser]

    def get(self, request, *args, **kwargs):
        # ... (lógica del reporte)
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
        return Response(reporte)


class ExportRegistrosExcelView(APIView):
    """
    API endpoint para exportar los registros de parto (data cruda) a Excel.
    SOLO SUPERVISOR.
    """
    permission_classes = [IsAuthenticated, IsSupervisorUser]

    def get(self, request, *args, **kwargs):
        # ... (lógica de exportación a Excel)
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
        ).prefetch_related(
            'parto_asociado__complicaciones'
        ).order_by('parto_asociado__fecha_parto')

        data = []
        for rn in qs:
            parto = rn.parto_asociado
            madre = parto.madre
            complicaciones_str = ", ".join([c.nombre for c in parto.complicaciones.all()])
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
                "Complicaciones": complicaciones_str or "Ninguna",
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