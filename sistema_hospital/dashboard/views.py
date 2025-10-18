from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from cuentas.decorators import admin_required, usuario_required


@login_required
@admin_required # <-- APLICA EL DECORADOR
def dashboard_admin(request):
    return render(request, 'dashboard/dashboard.html')

@login_required
@usuario_required # <-- APLICA EL DECORADOR
def dashboard_usuario(request):
    return render(request, 'dashboard/dashboard_usuario.html')