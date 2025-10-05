from django.shortcuts import render


def dashboard_view(request):
    return render(request, "dashboard/dashboard.html")


def vista_dashboard_usuario(request):
    return render(request, 'dashboard/dashboard_usuario.html')
