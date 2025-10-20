from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'cuentas'

urlpatterns = [
    path('logout/', auth_views.LogoutView.as_view(next_page='two_factor:login'), name='logout'),
    path('redirect/', views.redirect_view, name='redirect'),
]