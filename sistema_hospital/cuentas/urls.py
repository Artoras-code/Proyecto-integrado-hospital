from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views 

router = DefaultRouter()
router.register(r'equipos', api_views.EquipoViewSet, basename='equipo')
router.register(r'usuarios-opciones', api_views.UserOptionViewSet, basename='user-option')
router.register(r'users', api_views.UserViewSet, basename='user')
router.register(r'solicitudes-clave', api_views.SolicitudClaveViewSet, basename='solicitud-clave')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/login/', api_views.LoginAPIView.as_view(), name='auth-login'),
    path('api/auth/verify/', api_views.Verify2FAAPIView.as_view(), name='auth-verify'),
    path('api/auth/setup-2fa/', api_views.Generate2FAAPIView.as_view(), name='auth-setup-2fa'),
    path('api/auth/verify-setup/', api_views.VerifySetup2FAAPIView.as_view(), name='auth-verify-setup'),
    path('api/dashboard/stats/', api_views.dashboard_stats, name='dashboard-stats'),
    path('api/auth/solicitar-clave/', api_views.SolicitarCambioClaveView.as_view(), name='auth-solicitar-clave'),
]