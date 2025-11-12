# Proyecto-integrado-hospital/sistema_hospital/cuentas/urls.py
from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views
from . import api_views 
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', api_views.UserViewSet, basename='user')

app_name = 'cuentas'

urlpatterns = [
    # --- Rutas de API ---
    path('api/auth/login/', api_views.LoginAPIView.as_view(), name='api_login'),
    path('api/auth/verify/', api_views.Verify2FAAPIView.as_view(), name='api_verify_2fa'),
    path('api/auth/2fa/generate/', api_views.Generate2FAAPIView.as_view(), name='api_2fa_generate'),
    path('api/auth/2fa/verify-setup/', api_views.VerifySetup2FAAPIView.as_view(), name='api_2fa_verify_setup'),

    path('api/', include(router.urls)),
    
    # --- Rutas antiguas  ---
    path('logout/', auth_views.LogoutView.as_view(next_page='two_factor:login'), name='logout'),
    path('redirect/', views.redirect_view, name='redirect'),
]