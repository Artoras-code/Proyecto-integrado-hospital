from django.urls import path
from . import views

app_name = "dashboard"

urlpatterns = [
    # ELIMINAMOS la línea incorrecta que apuntaba a "dashboard_view"
    
    # Esta es la URL para el dashboard del Admin
    path('admin/', views.dashboard_admin, name='dashboard_admin'),
    
    # Esta es la URL para el dashboard de la Matrona (usuario)
    path('usuario/', views.dashboard_usuario, name='dashboard_usuario'),
]