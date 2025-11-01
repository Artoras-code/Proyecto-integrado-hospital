from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from cuentas.decorators import admin_required, supervisor_required, clinico_required
from django_otp.decorators import otp_required 

@login_required
@otp_required 
@admin_required
def dashboard_admin(request):
    return render(request, 'dashboard/dashboard.html')

@login_required
@otp_required
@supervisor_required
def dashboard_supervisor(request):
    return render(request, 'dashboard/dashboard_usuario.html')

@login_required
@otp_required
@clinico_required
def dashboard_clinico(request):
    return render(request, 'dashboard/dashboard_usuario.html')