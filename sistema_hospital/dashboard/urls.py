from django.urls import path
from . import views

app_name = "dashboard"

urlpatterns = [
    path('admin/', views.dashboard_admin, name='dashboard_admin'),
    path('usuario/', views.dashboard_usuario, name='dashboard_usuario'),
]