from django.urls import path
from . import views

app_name = "dashboard"

urlpatterns = [
    path('admin/', views.dashboard_admin, name='dashboard_admin'),
    path('supervisor/', views.dashboard_supervisor, name='dashboard_usuario'),
    path('clinico/', views.dashboard_clinico, name='dashboard_usuario'),
]