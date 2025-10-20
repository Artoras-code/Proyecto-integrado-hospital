from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from cuentas.decorators import admin_required, usuario_required
from django_otp.decorators import otp_required 

@login_required
@otp_required 
@admin_required
def dashboard_admin(request):
    return render(request, 'dashboard/dashboard.html')

@login_required
@otp_required
@usuario_required
def dashboard_usuario(request):
    return render(request, 'dashboard/dashboard_usuario.html')