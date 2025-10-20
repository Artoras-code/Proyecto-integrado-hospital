from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import CustomUser
from django.contrib.auth import logout
from django_otp import devices_for_user 

@login_required
def redirect_view(request):
    user = request.user

    if not list(devices_for_user(user)):

        return redirect('two_factor:setup')
    
    if not request.user.is_verified():
        return redirect('two_factor:login')

    if user.rol == CustomUser.ADMIN:
        return redirect('dashboard:dashboard_admin')
    elif user.rol == CustomUser.SUPERVISOR:
        return redirect('dashboard:dashboard_usuario')
    elif user.rol == CustomUser.DOCTOR or user.rol == CustomUser.ENFERMERO:
        return redirect('dashboard:dashboard_usuario')
    else:
        logout(request)
        return redirect('two_factor:login')