from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from . import api_views

app_name = "dashboard"

router = DefaultRouter()


router.register(r'madres', api_views.MadreViewSet, basename='madre')
router.register(r'recien-nacidos', api_views.RecienNacidoViewSet, basename='recien-nacido')
router.register(r'registros-parto', api_views.RegistroPartoViewSet, basename='registro-parto')
router.register(r'mis-registros', api_views.MisRegistrosViewSet, basename='mis-registros')
router.register(r'solicitudes-correccion', api_views.SolicitudCorreccionViewSet, basename='solicitud-correccion')
router.register(r'historial-altas', api_views.HistorialAltasViewSet, basename='historial-altas')
router.register(r'altas-validadas', api_views.RecienNacidosAltaValidadaViewSet, basename='altas-validadas')

urlpatterns = [
    path('admin/', views.dashboard_admin, name='dashboard_admin'),
    path('supervisor/', views.dashboard_supervisor, name='dashboard_usuario'),
    path('clinico/', views.dashboard_clinico, name='dashboard_usuario'),
    path('api/', include(router.urls)),
    path('api/reportes/rem/', api_views.ReporteREMView.as_view(), name='api-reporte-rem'),
    path('api/reportes/rem/pdf/', api_views.ExportReporteREMPDFView.as_view(), name='api-reporte-rem-pdf'),
    path('api/export/excel/', api_views.ExportRegistrosExcelView.as_view(), name='api-export-excel'),
    path('api/supervisor_dashboard_stats/', api_views.supervisor_dashboard_stats, name='api_supervisor_dashboard_stats'),
    path('api/comprobante/<int:pk>/pdf/', api_views.GenerarComprobantePDF.as_view(), name='comprobante_pdf'),
    path('api/defunciones/', api_views.DefuncionesViewSet.as_view(), name='api-defunciones'),
    path('api/certificado-defuncion/<str:tipo_paciente>/<int:pk>/pdf/', api_views.GenerarCertificadoDefuncionPDF.as_view(), name='certificado_defuncion_pdf'),
]