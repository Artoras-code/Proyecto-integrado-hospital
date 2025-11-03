from django.contrib import admin
from django.urls import path, include
from two_factor.urls import urlpatterns as tf_urls
from django.views.generic import RedirectView 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include(tf_urls)), 
    path('dashboard/', include('dashboard.urls')),
    path('cuentas/', include('cuentas.urls')),
    path('auditoria/', include('auditoria.urls')),
    path('', RedirectView.as_view(pattern_name='two_factor:login', permanent=False)), 
]