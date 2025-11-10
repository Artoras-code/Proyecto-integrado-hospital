from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from .models import HistorialSesion

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@receiver(user_logged_in)
def registrar_login(sender, request, user, **kwargs):
    HistorialSesion.objects.create(
        usuario=user, 
        accion='login',
        ip_address=get_client_ip(request)
    )

@receiver(user_logged_out)
def registrar_logout(sender, request, user, **kwargs):
    if user:
        HistorialSesion.objects.create(
            usuario=user, 
            accion='logout',
            ip_address=get_client_ip(request)
        )