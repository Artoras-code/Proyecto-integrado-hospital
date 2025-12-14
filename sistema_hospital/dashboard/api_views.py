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

# --- NUEVAS IMPORTACIONES PARA EL PDF PROFESIONAL ---
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape, legal
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from cuentas.permissions import (
    IsSupervisorUser, 
    IsClinicoUser, 
    IsSupervisorOrClinicoCreateRead,
    IsDoctorUser
)

from cuentas.models import Equipo, CustomUser 

from .models import (
    TipoParto, TipoAnalgesia,
    Madre, RegistroParto, RecienNacido,
    SolicitudCorreccion
)

from .serializers import (
    TipoPartoSerializer, TipoAnalgesiaSerializer,
    MadreSerializer, RecienNacidoSerializer, 
    RegistroPartoReadSerializer, RegistroPartoWriteSerializer,
    MisRegistrosWriteSerializer,
    SolicitudCorreccionSerializer
)

# --- VIEWSETS (Se mantienen igual) ---

class TipoPartoViewSet(AuditoriaMixin, viewsets.ModelViewSet):
    queryset = TipoParto.objects.all().order_by('nombre')
    serializer_class = TipoPartoSerializer
    permission_classes = [IsAuthenticated, IsSupervisorOrClinicoCreateRead] 

class TipoAnalgesiaViewSet(AuditoriaMixin, viewsets.ModelViewSet):
    queryset = TipoAnalgesia.objects.all().order_by('nombre')
    serializer_class = TipoAnalgesiaSerializer
    permission_classes = [IsAuthenticated, IsSupervisorOrClinicoCreateRead]

class HistorialAltasViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RecienNacidoSerializer
    permission_classes = [IsAuthenticated, IsSupervisorUser] 
    def get_queryset(self):
        return RecienNacido.objects.filter(fecha_alta__isnull=False).order_by('-fecha_alta')

class HistorialAltasMadresViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MadreSerializer
    permission_classes = [IsAuthenticated, IsSupervisorUser]
    def get_queryset(self):
        return Madre.objects.filter(fecha_alta__isnull=False).order_by('-fecha_alta')


class RecienNacidosAltaValidadaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RecienNacidoSerializer
    permission_classes = [IsAuthenticated, IsSupervisorUser]
    def get_queryset(self):
        return RecienNacido.objects.filter(alta_validada=True).order_by('-fecha_alta')

class DefuncionesViewSet(APIView):
    permission_classes = [IsAuthenticated, IsSupervisorOrClinicoCreateRead]
    def get(self, request):
        madres_fallecidas = Madre.objects.filter(fallecida=True).order_by('-fecha_fallecimiento')
        rn_fallecidos = RecienNacido.objects.filter(fallecido=True).order_by('-fecha_fallecimiento')
        data = {
            "madres": MadreSerializer(madres_fallecidas, many=True).data,
            "recien_nacidos": RecienNacidoSerializer(rn_fallecidos, many=True).data
        }
        return Response(data)

class MadreViewSet(AuditoriaMixin, viewsets.ModelViewSet):
    queryset = Madre.objects.all().order_by('nombre')
    serializer_class = MadreSerializer
    permission_classes = [IsAuthenticated, IsSupervisorOrClinicoCreateRead]

    @action(detail=True, methods=['post'], permission_classes=[IsDoctorUser])
    def dar_alta(self, request, pk=None):
        madre = self.get_object()
        if madre.fecha_alta: return Response({"error": "Ya tiene alta."}, status=400)
        if madre.fallecida: return Response({"error": "Paciente fallecido."}, status=400)
        madre.fecha_alta = request.data.get('fecha_alta') or timezone.now()
        madre.responsable_medico = request.user
        madre.save()
        self.registrar_accion(madre, 'modificacion', f"Alta médica por {request.user.username}")
        return Response(MadreSerializer(madre).data)

    @action(detail=True, methods=['post'], permission_classes=[IsDoctorUser])
    def registrar_defuncion(self, request, pk=None):
        madre = self.get_object()
        if madre.fallecida: return Response({"error": "Fallecimiento ya registrado."}, status=400)
        madre.fallecida = True
        madre.fecha_fallecimiento = request.data.get('fecha_fallecimiento') or timezone.now()
        madre.responsable_medico = request.user
        madre.save()
        self.registrar_accion(madre, 'modificacion', f"Defunción registrada por {request.user.username}")
        return Response(MadreSerializer(madre).data)

class RecienNacidoViewSet(AuditoriaMixin, viewsets.ModelViewSet):
    queryset = RecienNacido.objects.all().order_by('-parto_asociado__fecha_parto')
    serializer_class = RecienNacidoSerializer
    permission_classes = [IsAuthenticated, IsSupervisorOrClinicoCreateRead]

    @action(detail=True, methods=['post'], permission_classes=[IsDoctorUser])
    def dar_alta(self, request, pk=None):
        rn = self.get_object()
        if rn.fecha_alta: return Response({"error": "Ya tiene alta."}, status=400)
        if rn.fallecido: return Response({"error": "Paciente fallecido."}, status=400)
        rn.fecha_alta = request.data.get('fecha_alta', timezone.now())
        rn.alimentacion_alta = request.data.get('alimentacion_alta', 'LME')
        rn.responsable_medico = request.user
        rn.save()
        self.registrar_accion(rn, 'modificacion', f"Alta RN por {request.user.username}")
        return Response(RecienNacidoSerializer(rn).data)

    @action(detail=True, methods=['post'], permission_classes=[IsDoctorUser])
    def registrar_defuncion(self, request, pk=None):
        rn = self.get_object()
        if rn.fallecido: return Response({"error": "Fallecimiento ya registrado."}, status=400)
        rn.fallecido = True
        rn.fecha_fallecimiento = request.data.get('fecha_fallecimiento', timezone.now())
        rn.responsable_medico = request.user
        rn.save()
        self.registrar_accion(rn, 'modificacion', f"Defunción RN por {request.user.username}")
        return Response(RecienNacidoSerializer(rn).data)

class RegistroPartoViewSet(AuditoriaMixin, viewsets.ModelViewSet):
    queryset = RegistroParto.objects.all().order_by('-fecha_parto')
    permission_classes = [IsAuthenticated, IsSupervisorUser] 
    def get_serializer_class(self):
        return RegistroPartoReadSerializer if self.action in ['list', 'retrieve'] else RegistroPartoWriteSerializer

class MisRegistrosViewSet(AuditoriaMixin, viewsets.ModelViewSet):
    serializer_class = RegistroPartoReadSerializer
    permission_classes = [IsAuthenticated, IsClinicoUser]
    http_method_names = ['get', 'post', 'head', 'options']
    def get_queryset(self):
        user = self.request.user
        if user.rol == CustomUser.DOCTOR:
            equipo = Equipo.objects.filter(lider=user, activo=True).first()
            if equipo:
                ids = list(equipo.miembros.values_list('id', flat=True)) + [user.id]
                return RegistroParto.objects.filter(registrado_por__id__in=ids).order_by('-fecha_parto')
            return RegistroParto.objects.filter(registrado_por=user).order_by('-fecha_parto')
        return RegistroParto.objects.filter(registrado_por=user).order_by('-fecha_parto')
    
    def get_serializer_class(self):
        return RegistroPartoReadSerializer if self.action in ['list', 'retrieve'] else MisRegistrosWriteSerializer

    def perform_create(self, serializer):
        inst = serializer.save(registrado_por=self.request.user)
        self.registrar_accion(inst, 'creacion', "Creó registro desde Mis Registros")

    @action(detail=True, methods=['post'], permission_classes=[IsClinicoUser])
    def solicitar_correccion(self, request, pk=None):
        registro = self.get_object()
        if SolicitudCorreccion.objects.filter(registro=registro, estado='pendiente').exists():
            return Response({"error": "Ya existe solicitud pendiente."}, status=400)
        solicitud = SolicitudCorreccion.objects.create(registro=registro, solicitado_por=request.user, mensaje=request.data.get('mensaje', ''))
        self.registrar_accion(registro, 'solicitud', f"Solicitó corrección")
        return Response(SolicitudCorreccionSerializer(solicitud).data, status=201)

class SolicitudCorreccionViewSet(AuditoriaMixin, viewsets.ReadOnlyModelViewSet):
    queryset = SolicitudCorreccion.objects.all().order_by('-timestamp_creacion')
    serializer_class = SolicitudCorreccionSerializer
    permission_classes = [IsAuthenticated, IsSupervisorUser] 
    def get_queryset(self):
        qs = super().get_queryset()
        est = self.request.query_params.get('estado')
        return qs.filter(estado=est) if est else qs

    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        sol = self.get_object()
        if sol.estado == 'pendiente':
            sol.estado = 'resuelta'
            sol.resuelta_por = request.user
            sol.timestamp_resolucion = timezone.now()
            sol.save()
            self.registrar_accion(sol.registro, 'resolucion', f"Resuelta por {request.user.username}")
            return Response(SolicitudCorreccionSerializer(sol).data)
        return Response({"error": "Ya estaba resuelta."}, status=400)

# --- LÓGICA DE REPORTES REM ACTUALIZADA ---

def calcular_datos_rem(fecha_inicio, fecha_fin):
    # Filtros base
    partos_q = RegistroParto.objects.filter(fecha_parto__range=(fecha_inicio, fecha_fin))
    rn_q = RecienNacido.objects.filter(parto_asociado__in=partos_q)
    
    # Filtro de mortalidad (independiente de si nacieron en este periodo, se reporta el evento)
    madres_fallecidas_q = Madre.objects.filter(fallecida=True, fecha_fallecimiento__range=(fecha_inicio, fecha_fin))
    rn_fallecidos_q = RecienNacido.objects.filter(fallecido=True, fecha_fallecimiento__range=(fecha_inicio, fecha_fin))

    # --- SECCIÓN A: PARTOS Y GESTACIÓN ---
    seccion_a = partos_q.aggregate(
        total_partos=Count('id'),
        vaginal_espontaneo=Count('id', filter=Q(tipo_parto__nombre__icontains='Espontáneo')),
        vaginal_instrumental=Count('id', filter=Q(tipo_parto__nombre__icontains='Instrumental')),
        cesarea_electiva=Count('id', filter=Q(tipo_parto__nombre='Cesárea Electiva')),
        cesarea_urgencia=Count('id', filter=Q(tipo_parto__nombre='Cesárea de Urgencia')),
        # Condiciones
        con_oxitocina=Count('id', filter=Q(uso_oxitocina=True)),
        con_ligadura_tardia=Count('id', filter=Q(ligadura_tardia_cordon=True)),
        con_piel_a_piel=Count('id', filter=Q(contacto_piel_a_piel=True)),
        # Edad Gestacional
        pretermino=Count('id', filter=Q(edad_gestacional_semanas__lt=37)),
        termino=Count('id', filter=Q(edad_gestacional_semanas__gte=37, edad_gestacional_semanas__lte=41)),
        posttermino=Count('id', filter=Q(edad_gestacional_semanas__gte=42)),
    )

    # --- DEMOGRAFÍA MATERNA (Cálculo manual por simplicidad en fechas) ---
    madres_ids = partos_q.values_list('madre_id', flat=True)
    madres = Madre.objects.filter(id__in=madres_ids)
    
    adolescente = 0 # < 18
    adulta = 0      # 18 - 34
    anosa = 0       # >= 35
    year_actual = fecha_inicio.year

    for m in madres:
        edad = year_actual - m.fecha_nacimiento.year
        if edad < 18: adolescente += 1
        elif edad >= 35: anosa += 1
        else: adulta += 1

    seccion_demografia = {
        'adolescente': adolescente,
        'adulta': adulta,
        'anosa': anosa,
        'chilena': madres.filter(nacionalidad='Chilena').count(),
        'extranjera': madres.exclude(nacionalidad='Chilena').count(),
        'pueblo_originario': madres.filter(pertenece_pueblo_originario=True).count()
    }

    # --- SECCIÓN D.1: PESO Y SEXO RN ---
    seccion_d1 = rn_q.aggregate(
        total_rn=Count('id'),
        peso_menor_1500=Count('id', filter=Q(peso_grs__lt=1500)), # Agrupado crítico
        peso_1500_2499=Count('id', filter=Q(peso_grs__gte=1500, peso_grs__lte=2499)),
        peso_2500_3999=Count('id', filter=Q(peso_grs__gte=2500, peso_grs__lte=3999)),
        peso_mayor_4000=Count('id', filter=Q(peso_grs__gte=4000)),
        # Detalle fino para tabla
        p_lt_500=Count('id', filter=Q(peso_grs__lt=500)),
        p_500_999=Count('id', filter=Q(peso_grs__gte=500, peso_grs__lte=999)),
        p_1000_1499=Count('id', filter=Q(peso_grs__gte=1000, peso_grs__lte=1499)),
        p_1500_1999=Count('id', filter=Q(peso_grs__gte=1500, peso_grs__lte=1999)),
        p_2000_2499=Count('id', filter=Q(peso_grs__gte=2000, peso_grs__lte=2499)),
        p_2500_2999=Count('id', filter=Q(peso_grs__gte=2500, peso_grs__lte=2999)),
        p_3000_3999=Count('id', filter=Q(peso_grs__gte=3000, peso_grs__lte=3999)),
        p_gte_4000=Count('id', filter=Q(peso_grs__gte=4000)),
        
        con_anomalia=Count('id', filter=Q(anomalia_congenita=True)),
        sexo_m=Count('id', filter=Q(sexo='M')),
        sexo_f=Count('id', filter=Q(sexo='F')),
        sexo_i=Count('id', filter=Q(sexo='I')),
    )

    # --- SECCIÓN D.2: ATENCIÓN INMEDIATA ---
    seccion_d2 = rn_q.aggregate(
        profilaxis_ocular=Count('id', filter=Q(profilaxis_ocular=True)),
        profilaxis_hepb=Count('id', filter=Q(vacuna_hepatitis_b=True)),
        # Tipo parto desde perspectiva RN (pueden ser gemelos con distinto resultado teorico, aunque raro)
        rn_vaginal=Count('id', filter=Q(parto_asociado__tipo_parto__nombre__icontains='Espontáneo')),
        rn_instrumental=Count('id', filter=Q(parto_asociado__tipo_parto__nombre__icontains='Instrumental')),
        rn_cesarea=Count('id', filter=Q(parto_asociado__tipo_parto__nombre__icontains='Cesárea')),
        # Apgar
        apgar_1_critico=Count('id', filter=Q(apgar_1_min__lte=3)),
        apgar_5_critico=Count('id', filter=Q(apgar_5_min__lte=6)),
        # Reanimacion
        reanimacion_basica=Count('id', filter=Q(reanimacion='basica')),
        reanimacion_avanzada=Count('id', filter=Q(reanimacion='avanzada')),
    )

    # --- SECCIÓN E: ALIMENTACIÓN ---
    es_migrante = ~Q(parto_asociado__madre__nacionalidad='Chilena') & Q(parto_asociado__madre__nacionalidad__isnull=False)
    es_pueblo = Q(parto_asociado__madre__pertenece_pueblo_originario=True)

    seccion_e = rn_q.aggregate(
        lme_total=Count('id', filter=Q(alimentacion_alta='LME')),
        mixta_total=Count('id', filter=Q(alimentacion_alta='LMixta')),
        formula_total=Count('id', filter=Q(alimentacion_alta='Formula')),
        lme_migrante=Count('id', filter=Q(alimentacion_alta='LME') & es_migrante),
        mixta_migrante=Count('id', filter=Q(alimentacion_alta='LMixta') & es_migrante),
        formula_migrante=Count('id', filter=Q(alimentacion_alta='Formula') & es_migrante),
        lme_pueblo=Count('id', filter=Q(alimentacion_alta='LME') & es_pueblo),
        mixta_pueblo=Count('id', filter=Q(alimentacion_alta='LMixta') & es_pueblo),
        formula_pueblo=Count('id', filter=Q(alimentacion_alta='Formula') & es_pueblo),
    )

    # --- MORTALIDAD ---
    seccion_mortalidad = {
        'materna': madres_fallecidas_q.count(),
        'neonatal': rn_fallecidos_q.count()
    }

    return {
        'a': seccion_a,
        'demo': seccion_demografia,
        'd1': seccion_d1,
        'd2': seccion_d2,
        'e': seccion_e,
        'mort': seccion_mortalidad
    }


class ReporteREMView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisorUser]
    def get(self, request, *args, **kwargs):
        try:
            fi = datetime.strptime(request.query_params.get('fecha_inicio'), '%Y-%m-%d').replace(hour=0, minute=0, second=0)
            ff = datetime.strptime(request.query_params.get('fecha_fin'), '%Y-%m-%d').replace(hour=23, minute=59, second=59)
        except: return Response({"error": "Fechas inválidas"}, 400)

        data = calcular_datos_rem(fi, ff)
        # Desempaquetamos data que ya viene con la estructura correcta ('a', 'd1', etc.)
        return Response({
            "rango_fechas": {"inicio": request.query_params.get('fecha_inicio'), "fin": request.query_params.get('fecha_fin')},
            "seccion_a": data['a'],
            "seccion_demografia": data['demo'],
            "seccion_d1": data['d1'],
            "seccion_d2": data['d2'],
            "seccion_e": data['e'],
            "seccion_mortalidad": data['mort']
        })

# --- PDF MEJORADO Y PROFESIONAL ---
class ExportReporteREMPDFView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisorUser]

    def get(self, request, *args, **kwargs):
        try:
            f_inicio_str = request.query_params.get('fecha_inicio')
            f_fin_str = request.query_params.get('fecha_fin')
            fi = datetime.strptime(f_inicio_str, '%Y-%m-%d').replace(hour=0, minute=0, second=0)
            ff = datetime.strptime(f_fin_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
        except (ValueError, TypeError):
            return Response({"error": "Fechas inválidas o no proporcionadas"}, 400)

        # 2. Obtener Datos
        data = calcular_datos_rem(fi, ff)
        
        # 3. Configurar PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=landscape(legal), # Legal Landscape para que quepan las tablas anchas
            rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30
        )
        
        elements = []
        styles = getSampleStyleSheet()
        
        # --- Estilos Personalizados ---
        style_title = ParagraphStyle('CustomTitle', parent=styles['Title'], fontSize=16, leading=20, alignment=TA_CENTER, spaceAfter=20)
        style_subtitle = ParagraphStyle('CustomSub', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor('#2c3e50'), spaceBefore=15, spaceAfter=5)
        style_cell_center = ParagraphStyle('CellCenter', parent=styles['Normal'], alignment=TA_CENTER, fontSize=9)
        style_cell_left = ParagraphStyle('CellLeft', parent=styles['Normal'], alignment=TA_LEFT, fontSize=9)
        style_cell_header = ParagraphStyle('CellHeader', parent=styles['Normal'], alignment=TA_CENTER, fontSize=9, fontName='Helvetica-Bold', textColor=colors.white)

        # --- Encabezado Institucional ---
        header_data = [
            [Paragraph("<b>MINISTERIO DE SALUD</b><br/>Servicio de Salud Ñuble<br/>Hospital Clínico Herminda Martín", style_cell_left),
             Paragraph(f"<b>INFORME ESTADÍSTICO MENSUAL (REM A.24)</b><br/>Periodo: {f_inicio_str} al {f_fin_str}", style_cell_center)]
        ]
        t_header = Table(header_data, colWidths=[300, 450])
        t_header.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LINEBELOW', (0,0), (-1,-1), 1, colors.black),
        ]))
        elements.append(t_header)
        elements.append(Spacer(1, 20))

        # ---------------------------------------------------------------------
        # TABLA RESUMEN EJECUTIVO (KPIs)
        # ---------------------------------------------------------------------
        elements.append(Paragraph("I. RESUMEN GENERAL Y DEMOGRAFÍA", style_subtitle))
        
        d_resumen = [
            ['INDICADOR', 'CANTIDAD', 'INDICADOR', 'CANTIDAD'],
            ['Total Partos', data['a']['total_partos'], 'Mortalidad Materna', data['mort']['materna']],
            ['Total Nacidos Vivos', data['d1']['total_rn'], 'Mortalidad Neonatal', data['mort']['neonatal']],
            ['Cesáreas (Total)', data['a']['cesarea_electiva'] + data['a']['cesarea_urgencia'], 'Madres Adolescentes (<18)', data['demo']['adolescente']],
            ['Prematuros (<37 sem)', data['a']['pretermino'], 'Madres Extranjeras', data['demo']['extranjera']],
        ]
        
        t_resumen = Table(d_resumen, colWidths=[150, 80, 150, 80])
        t_resumen.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#34495e')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BACKGROUND', (0,1), (-1,-1), colors.whitesmoke),
        ]))
        elements.append(t_resumen)
        elements.append(Spacer(1, 15))

        # ---------------------------------------------------------------------
        # SECCIÓN A: CARACTERIZACIÓN DEL PARTO
        # ---------------------------------------------------------------------
        elements.append(Paragraph("SECCIÓN A: CARACTERIZACIÓN DEL PARTO Y GESTACIÓN", style_subtitle))
        
        d_seccion_a = [
            [Paragraph('TIPO DE PARTO', style_cell_header), Paragraph('TOTAL', style_cell_header), Paragraph('CONDICIONES CLÍNICAS', style_cell_header), Paragraph('TOTAL', style_cell_header)],
            ['Parto Vaginal Espontáneo', data['a']['vaginal_espontaneo'], 'Uso de Oxitocina', data['a']['con_oxitocina']],
            ['Parto Vaginal Instrumental', data['a']['vaginal_instrumental'], 'Ligadura Tardía Cordón', data['a']['con_ligadura_tardia']],
            ['Cesárea Electiva', data['a']['cesarea_electiva'], 'Contacto Piel a Piel', data['a']['con_piel_a_piel']],
            ['Cesárea Urgencia', data['a']['cesarea_urgencia'], 'Edad Gest. < 37 sem', data['a']['pretermino']],
            ['', '', 'Edad Gest. > 42 sem', data['a']['posttermino']],
        ]
        
        t_a = Table(d_seccion_a, colWidths=[200, 60, 200, 60])
        t_a.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2980b9')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
            ('ALIGN', (1,1), (1,-1), 'CENTER'),
            ('ALIGN', (3,1), (3,-1), 'CENTER'),
            ('SPAN', (0,5), (1,5)),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ]))
        elements.append(t_a)
        elements.append(Spacer(1, 15))

        # ---------------------------------------------------------------------
        # SECCIÓN D.1: RECIÉN NACIDO (PESO Y SEXO)
        # ---------------------------------------------------------------------
        elements.append(Paragraph("SECCIÓN D.1: RECIÉN NACIDO (PESO AL NACER)", style_subtitle))
        
        d_d1 = [
            ['RANGO DE PESO (gramos)', 'CANTIDAD', 'SEXO DEL RN', 'CANTIDAD'],
            ['< 500 g', data['d1']['p_lt_500'], 'Masculino', data['d1']['sexo_m']],
            ['500 - 999 g', data['d1']['p_500_999'], 'Femenino', data['d1']['sexo_f']],
            ['1000 - 1499 g', data['d1']['p_1000_1499'], 'Indeterminado', data['d1']['sexo_i']],
            ['1500 - 1999 g', data['d1']['p_1500_1999'], '', ''],
            ['2000 - 2499 g', data['d1']['p_2000_2499'], 'OTROS INDICADORES', ''],
            ['2500 - 2999 g', data['d1']['p_2500_2999'], 'Anomalía Congénita', data['d1']['con_anomalia']],
            ['3000 - 3999 g', data['d1']['p_3000_3999'], '', ''],
            ['≥ 4000 g', data['d1']['p_gte_4000'], '', ''],
            ['TOTAL', data['d1']['total_rn'], '', ''],
        ]

        t_d1 = Table(d_d1, colWidths=[150, 60, 150, 60])
        t_d1.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#8e44ad')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
            ('ALIGN', (1,0), (1,-1), 'CENTER'),
            ('ALIGN', (3,0), (3,-1), 'CENTER'),
            ('BACKGROUND', (0, -1), (1, -1), colors.lightgrey),
            ('FONTNAME', (0, -1), (1, -1), 'Helvetica-Bold'),
        ]))
        elements.append(t_d1)
        elements.append(Spacer(1, 15))

        # ---------------------------------------------------------------------
        # SECCIÓN D.2: ATENCIÓN INMEDIATA
        # ---------------------------------------------------------------------
        elements.append(Paragraph("SECCIÓN D.2: ATENCIÓN INMEDIATA Y REANIMACIÓN", style_subtitle))

        d_d2 = [
            ['PROFILAXIS', 'Cant.', 'CONDICIÓN / APGAR', 'Cant.', 'REANIMACIÓN', 'Cant.'],
            ['Ocular (Eritromicina)', data['d2']['profilaxis_ocular'], "Apgar 1' ≤ 3", data['d2']['apgar_1_critico'], 'Básica', data['d2']['reanimacion_basica']],
            ['Vacuna Hepatitis B', data['d2']['profilaxis_hepb'], "Apgar 5' ≤ 6", data['d2']['apgar_5_critico'], 'Avanzada', data['d2']['reanimacion_avanzada']],
            ['', '', '', '', '(Masaje/Drogas)', '']
        ]

        t_d2 = Table(d_d2, colWidths=[120, 40, 120, 40, 120, 40])
        t_d2.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#27ae60')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
            ('ALIGN', (1,0), (1,-1), 'CENTER'),
            ('ALIGN', (3,0), (3,-1), 'CENTER'),
            ('ALIGN', (5,0), (5,-1), 'CENTER'),
        ]))
        elements.append(t_d2)
        elements.append(Spacer(1, 15))

        # ---------------------------------------------------------------------
        # SECCIÓN E: ALIMENTACIÓN AL ALTA
        # ---------------------------------------------------------------------
        elements.append(Paragraph("SECCIÓN E: ALIMENTACIÓN AL ALTA (Desglose)", style_subtitle))
        
        d_e = [
            ['TIPO ALIMENTACIÓN', 'TOTAL GENERAL', 'PUEBLOS ORIGINARIOS', 'POBLACIÓN MIGRANTE'],
            ['Lactancia Materna Excl.', data['e']['lme_total'], data['e']['lme_pueblo'], data['e']['lme_migrante']],
            ['Lactancia Mixta', data['e']['mixta_total'], data['e']['mixta_pueblo'], data['e']['mixta_migrante']],
            ['Fórmula Artificial', data['e']['formula_total'], data['e']['formula_pueblo'], data['e']['formula_migrante']],
        ]

        t_e = Table(d_e, colWidths=[180, 100, 120, 120])
        t_e.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#d35400')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
            ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ]))
        elements.append(t_e)

        # Footer Simple
        elements.append(Spacer(1, 40))
        elements.append(Paragraph(f"Generado por Sistema Hospitalario el {datetime.now().strftime('%d/%m/%Y %H:%M')}", style_cell_left))

        doc.build(elements)
        buffer.seek(0)
        
        response = HttpResponse(buffer, content_type='application/pdf')
        filename = f"REM_A24_{f_inicio_str}_al_{f_fin_str}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class ExportRegistrosExcelView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisorUser]
    def get(self, request, *args, **kwargs):
        try:
            fi = datetime.strptime(request.query_params.get('fecha_inicio'), '%Y-%m-%d').replace(hour=0, minute=0, second=0)
            ff = datetime.strptime(request.query_params.get('fecha_fin'), '%Y-%m-%d').replace(hour=23, minute=59, second=59)
        except: return Response({"error": "Fechas inválidas"}, 400)

        qs = RecienNacido.objects.filter(parto_asociado__fecha_parto__range=(fi, ff)).select_related('parto_asociado__madre', 'parto_asociado__tipo_parto').order_by('parto_asociado__fecha_parto')
        data = []
        for rn in qs:
            p = rn.parto_asociado
            data.append({
                "RUT Madre": p.madre.rut,
                "Fecha": p.fecha_parto.strftime('%d/%m/%Y'),
                "Peso": rn.peso_grs,
                "APGAR 1": rn.apgar_1_min,
                "APGAR 5": rn.apgar_5_min,
                "Reanimacion": rn.get_reanimacion_display(), 
                "Anomalia": "SI" if rn.anomalia_congenita else "NO", 
                "Alimentacion": rn.get_alimentacion_alta_display() 
            })
        df = pd.DataFrame(data)
        buffer = BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer: df.to_excel(writer, index=False)
        buffer.seek(0)
        resp = HttpResponse(buffer, content_type='application/vnd.ms-excel')
        resp['Content-Disposition'] = 'attachment; filename="reporte.xlsx"'
        return resp

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSupervisorUser])
def supervisor_dashboard_stats(request):
    pending = SolicitudCorreccion.objects.filter(estado='pendiente').count()
    today = timezone.now()
    registros = RegistroParto.objects.filter(fecha_parto__year=today.year, fecha_parto__month=today.month).count()
    latest = SolicitudCorreccion.objects.filter(estado='pendiente').order_by('-timestamp_creacion')[:5]
    fmt = [{'id':s.id, 'mensaje':s.mensaje, 'registro_id':s.registro.id, 'solicitado_por': s.solicitado_por.username if s.solicitado_por else 'N/A', 'timestamp': s.timestamp_creacion.strftime('%Y-%m-%d')} for s in latest]
    return Response({'pending_corrections_count': pending, 'registros_this_month': registros, 'latest_pending_corrections': fmt})

class GenerarComprobantePDF(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk=None):
        try:
            parto = RegistroParto.objects.get(pk=pk)
            recien_nacidos = parto.recien_nacidos.all()
        except: return Response(status=404)
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        title = ParagraphStyle(name='C', parent=styles['Title'], alignment=TA_CENTER)
        header = ParagraphStyle(name='H', parent=styles['Heading3'], alignment=TA_CENTER)
        
        elements.append(Paragraph("HOSPITAL CLÍNICO HERMINDA MARTÍN", title))
        elements.append(Paragraph("SERVICIO DE OBSTETRICIA Y GINECOLOGÍA", header))
        elements.append(Spacer(1, 20))
        elements.append(Paragraph(f"COMPROBANTE DE PARTO N° {parto.id}", title))
        elements.append(Spacer(1, 10))

        atendido = parto.personal_atiende or ("Dr/a. " + parto.registrado_por.username if parto.registrado_por.rol == 'doctor' else "No registrado")
        
        data_madre = [
            ['Madre:', parto.madre.nombre, 'RUT:', parto.madre.rut],
            ['Fecha:', parto.fecha_parto.strftime('%d/%m/%Y %H:%M'), 'Atendido por:', atendido],
            ['Tipo Parto:', str(parto.tipo_parto), 'Analgesia:', str(parto.tipo_analgesia)]
        ]
        t_madre = Table(data_madre, colWidths=[80, 200, 60, 180])
        t_madre.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('BACKGROUND', (0,0), (0,-1), colors.whitesmoke), ('BACKGROUND', (2,0), (2,-1), colors.whitesmoke)]))
        elements.append(t_madre)
        elements.append(Spacer(1, 20))

        data_rn = [['Sexo', 'Peso', 'Talla', 'APGAR 1', 'APGAR 5']]
        for rn in recien_nacidos:
            data_rn.append([rn.get_sexo_display(), f"{rn.peso_grs} g", f"{rn.talla_cm} cm", rn.apgar_1_min, rn.apgar_5_min])
        
        t_rn = Table(data_rn, colWidths=[80, 80, 80, 80, 80])
        t_rn.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 1, colors.black), ('BACKGROUND', (0,0), (-1,0), colors.lightgrey), ('ALIGN', (0,0), (-1,-1), 'CENTER')]))
        elements.append(t_rn)
        
        doc.build(elements)
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')

class GenerarCertificadoDefuncionPDF(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, tipo_paciente, pk):
        try:
            if tipo_paciente == 'madre':
                obj = Madre.objects.get(pk=pk)
                if not obj.fallecida: return Response({"error": "No fallecida"}, 400)
                nombre = obj.nombre
                rut = obj.rut
                fecha = obj.fecha_fallecimiento
                titulo = "PACIENTE (MADRE)"
            elif tipo_paciente == 'rn':
                obj = RecienNacido.objects.get(pk=pk)
                if not obj.fallecido: return Response({"error": "No fallecido"}, 400)
                nombre = f"Recién Nacido de {obj.parto_asociado.madre.nombre}"
                rut = f"ID: {obj.id}"
                fecha = obj.fecha_fallecimiento
                titulo = "PACIENTE (RECIÉN NACIDO)"
            else: return Response(status=400)
        except: return Response(status=404)

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        elements.append(Paragraph("HOSPITAL CLÍNICO HERMINDA MARTÍN", styles['Title']))
        elements.append(Paragraph("CERTIFICADO DE DEFUNCIÓN", styles['Heading2']))
        elements.append(Spacer(1, 20))
        elements.append(Paragraph(f"<b>{titulo}</b>", styles['Heading3']))
        
        data = [
            ['Nombre:', nombre],
            ['Identificación:', rut],
            ['Fecha Defunción:', fecha.strftime('%d/%m/%Y %H:%M') if fecha else 'Sin registro'],
            ['Certificado por:', f"Dr/a. {obj.responsable_medico.username}" if obj.responsable_medico else "Sistema"]
        ]
        t = Table(data, colWidths=[120, 300])
        t.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 1, colors.black), ('BACKGROUND', (0,0), (0,-1), colors.whitesmoke)]))
        elements.append(t)
        
        elements.append(Spacer(1, 50))
        elements.append(Paragraph("__________________________<br/>Firma Médico Responsable", styles['Normal']))

        doc.build(elements)
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')