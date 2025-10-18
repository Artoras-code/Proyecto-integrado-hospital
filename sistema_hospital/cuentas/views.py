from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.decorators import login_required
from .models import CustomUser
from django.contrib.auth import logout

class CustomLoginView(LoginView):
    template_name = 'cuentas/login.html'
class CustomLogoutView(LogoutView):
    def get(self, request, *args, **kwargs):
        logout(request)
        return redirect('cuentas:login')


@login_required
def redirect_view(request):
    if request.user.rol == CustomUser.ADMIN:
        return redirect('dashboard:dashboard_admin')
    elif request.user.rol == CustomUser.USUARIO:
        return redirect('dashboard:dashboard_usuario')
    else:
        return redirect('cuentas:login')
