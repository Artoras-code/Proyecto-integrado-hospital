from django.urls import path
from . import views

urlpatterns = [
    path("", views.dashboard_view, name="dashboard"),
    path("", views.vista_dashboard_usuario, name="dashboard_usuario"),
]
