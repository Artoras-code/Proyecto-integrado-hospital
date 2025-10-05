from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth import logout

def login_view(request):
    if request.method == "POST":
   
        username = request.POST.get("username")
        password = request.POST.get("password")
        
        # Autenticamos solo si hay datos
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("dashboard")  # Redirige al dashboard si las credenciales son correctas
        else:
            messages.error(request, "Usuario o contraseña incorrectos")
    
    
    return render(request, "cuentas/login.html")

def logout_view(request):
    logout(request)
    return redirect('login')
