# ...
from django.contrib import admin
from django.urls import path, include
# from django_otp.views import LoginView as OTPLoginView # <--- Comenta esto

urlpatterns = [
    path('admin/', admin.site.urls),

    # Comenta esta línea por ahora
    # path('cuentas/login/', OTPLoginView.as_view(template_name='cuentas/login.html'), name='login'),

    path('dashboard/', include('dashboard.urls')),
    path('', include('cuentas.urls')), 
]