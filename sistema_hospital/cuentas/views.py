from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import logout
from cuentas.models import Usuario

# Creacion de otra vista


#funcionalidad de login

def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        try:
            usuario = Usuario.objects.get(username=username, password=password)
            if usuario.username == "administrador":
                return redirect("dashboard_admin")
            else:
                return redirect("dashboard_usuario")
        except Usuario.DoesNotExist:
            messages.error(request, "Username o contraseña incorrectos")

    return render(request, "cuentas/login.html")


def logout_view(request):
    logout(request)
    return redirect('login')
