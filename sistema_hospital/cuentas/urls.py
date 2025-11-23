from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views  # <--- IMPORTANTE: Usamos api_views, no views

router = DefaultRouter()
# Rutas para gestión (Equipos y Usuarios)
router.register(r'equipos', api_views.EquipoViewSet, basename='equipo')
router.register(r'usuarios-opciones', api_views.UserOptionViewSet, basename='user-option')
router.register(r'users', api_views.UserViewSet, basename='user')

urlpatterns = [
    # Rutas automáticas de la API (Equipos, Usuarios)
    path('api/', include(router.urls)),
    
    # --- RUTAS DE AUTENTICACIÓN CORREGIDAS ---
    # Usamos 'api_views.LoginAPIView', que es el nombre real de tu clase
    path('api/auth/login/', api_views.LoginAPIView.as_view(), name='auth-login'),
    path('api/auth/verify/', api_views.Verify2FAAPIView.as_view(), name='auth-verify'),
    path('api/auth/setup-2fa/', api_views.Generate2FAAPIView.as_view(), name='auth-setup-2fa'),
    path('api/auth/verify-setup/', api_views.VerifySetup2FAAPIView.as_view(), name='auth-verify-setup'),
    
    # Dashboard Stats
    path('api/dashboard/stats/', api_views.dashboard_stats, name='dashboard-stats'),
]