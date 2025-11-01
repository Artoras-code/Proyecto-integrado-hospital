# sistema_hospital/cuentas/decorators.py
from django.contrib.auth.decorators import user_passes_test
from django.shortcuts import redirect
from .models import CustomUser

def admin_required(view_func):
    decorated_view_func = user_passes_test(
        lambda u: u.is_active and u.rol == CustomUser.ADMIN,
        login_url='two_factor:login' 
    )(view_func)
    return decorated_view_func

def supervisor_required(view_func):
    decorated_view_func = user_passes_test(
        lambda u: u.is_active and u.rol == CustomUser.SUPERVISOR,
        login_url='two_factor:login' 
    )(view_func)
    return decorated_view_func

def clinico_required(view_func):
    decorated_view_func = user_passes_test(
        lambda u: u.is_active and u.rol == CustomUser.DOCTOR or u.rol == CustomUser.ENFERMERO,
        login_url='two_factor:login' 
    )(view_func)
    return decorated_view_func