from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from . import api_views

app_name = "dashboard"

# Creamos un router para los parámetros y los nuevos modelos
router = DefaultRouter()

# Rutas de Parámetros (Supervisor)
router.register(r'parametros/tipos-parto', api_views.TipoPartoViewSet, basename='tipo-parto')
router.register(r'parametros/tipos-analgesia', api_views.TipoAnalgesiaViewSet, basename='tipo-analgesia')
router.register(r'parametros/complicaciones-parto', api_views.ComplicacionPartoViewSet, basename='complicacion-parto')

# Rutas de CRUD (Supervisor)
router.register(r'madres', api_views.MadreViewSet, basename='madre')
router.register(r'recien-nacidos', api_views.RecienNacidoViewSet, basename='recien-nacido')
router.register(r'registros-parto', api_views.RegistroPartoViewSet, basename='registro-parto')

# --- ¡NUEVA RUTA PARA "MIS REGISTROS" (Clínico)! ---
router.register(r'mis-registros', api_views.MisRegistrosViewSet, basename='mis-registros')


urlpatterns = [
    # Vistas antiguas de plantillas (las mantenemos por si acaso)
    path('admin/', views.dashboard_admin, name='dashboard_admin'),
    path('supervisor/', views.dashboard_supervisor, name='dashboard_usuario'),
    path('clinico/', views.dashboard_clinico, name='dashboard_usuario'),
    
    # --- RUTAS DE API (del router) ---
    # Esto publicará todas las rutas que registramos en el router
    # bajo el prefijo /dashboard/api/
    path('api/', include(router.urls)),
    
    # --- RUTAS DE REPORTES (Supervisor) ---
    path('api/reportes/rem/', api_views.ReporteREMView.as_view(), name='api-reporte-rem'),
    path('api/export/excel/', api_views.ExportRegistrosExcelView.as_view(), name='api-export-excel'),
]