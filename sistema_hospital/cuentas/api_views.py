from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp import devices_for_user

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Q
from django.utils import timezone
from auditoria.models import HistorialSesion, HistorialAccion
from .models import CustomUser  # <-- ¡ESTA ERA LA LÍNEA QUE FALTABA!

from auditoria.signals import registrar_login 
from .models import CustomUser
from auditoria.signals import registrar_login # signal de auditoría
from auditoria.mixins import AuditoriaMixin


from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth import login

import qrcode
import qrcode.image.svg
import io
import base64

from rest_framework import viewsets
from rest_framework.decorators import action
from .serializers import UserSerializer


# ... (Todo el código de LoginAPIView, Verify2FAAPIView, Generate2FAAPIView, VerifySetup2FAAPIView, y UserViewSet se mantiene igual) ...

class LoginAPIView(APIView):
    """
    API View para el primer paso del login: Usuario y Contraseña.
    """
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {"error": "Por favor, ingrese usuario y contraseña"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {"error": "Credenciales inválidas"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        devices = list(devices_for_user(user))
        
        if not devices:
            return Response(
                {"step": "2fa_setup_required", "username": user.username}, 
                status=status.HTTP_200_OK
            )

        return Response(
            {"step": "2fa_required", "username": user.username}, 
            status=status.HTTP_200_OK
        )

class Verify2FAAPIView(APIView):
    """
    API View para el segundo paso del login: Verificar el token 2FA (OTP).
    """
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        otp_token = request.data.get('otp_token')

        if not username or not otp_token:
            return Response(
                {"error": "Se requiere usuario y código 2FA"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Usuario no encontrado"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        for device in devices_for_user(user):
            if device.verify_token(otp_token):
                refresh = RefreshToken.for_user(user)
                try:
                    registrar_login(sender=CustomUser, request=request, user=user)
                except Exception as e:
                    print(f"Error al registrar login en auditoría: {e}")

                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'rol': user.rol,
                        'rut': user.rut, 
                    }
                }, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Código 2FA inválido"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


class Generate2FAAPIView(APIView):
    """
    API View para generar un nuevo dispositivo 2FA (TOTP).
    """
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        if not username:
            return Response({"error": "Username requerido"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        if list(devices_for_user(user)):
            return Response({"error": "Este usuario ya tiene 2FA configurado."}, status=status.HTTP_400_BAD_REQUEST)

        TOTPDevice.objects.filter(user=user, confirmed=False).delete()
        
        device = user.totpdevice_set.create(confirmed=False)
        
        img = qrcode.make(device.config_url, image_factory=qrcode.image.svg.SvgImage)
        buffer = io.BytesIO()
        img.save(buffer)
        
        svg_data = buffer.getvalue().decode()
        qr_code_data_url = f"data:image/svg+xml;base64,{base64.b64encode(svg_data.encode('utf-8')).decode('utf-8')}"

        return Response({
            "qr_code_data": qr_code_data_url,
            "secret_key": device.key
        }, status=status.HTTP_200_OK)


class VerifySetup2FAAPIView(APIView):
    """
    API View para verificar y confirmar el 2FA por primera vez.
    """
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        otp_token = request.data.get('otp_token')

        if not username or not otp_token:
            return Response({"error": "Se requiere usuario y código 2FA"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        device = user.totpdevice_set.filter(confirmed=False).first()
        
        if not device:
             return Response({"error": "No se encontró un dispositivo 2FA pendiente de configuración."}, status=status.HTTP_400_BAD_REQUEST)

        if device.verify_token(otp_token):
            device.confirmed = True
            device.save()
            
            try:
                login(request, user) 
                registrar_login(sender=CustomUser, request=request, user=user)
            except Exception as e:
                print(f"Error al registrar login en auditoría: {e}")

            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'rol': user.rol,
                    'rut': user.rut,
                }
            }, status=status.HTTP_200_OK)
        
        return Response({"error": "Código 2FA inválido"}, status=status.HTTP_401_UNAUTHORIZED)

class UserViewSet(AuditoriaMixin,viewsets.ModelViewSet):
    """
    API endpoint que permite a los administradores ver, crear, editar y eliminar usuarios.
    """
    queryset = CustomUser.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] 

    @action(detail=True, methods=['post'], name='Reset 2FA')
    def reset_2fa(self, request, pk=None):
        """
        Acción personalizada para borrar los dispositivos 2FA de un usuario.
        """
        try:
            user = self.get_object()
            TOTPDevice.objects.filter(user=user).delete()
            # Registro para la auditoria
            self.registrar_accion(
                instance=user, 
                accion='modificacion', 
                detalles=f"Administrador reseteó el 2FA para el usuario {user.username}"
            )
            return Response(
                {'status': 'Dispositivos 2FA eliminados.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# --- VISTA DE DASHBOARD CORREGIDA ---
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_stats(request):
    """
    API endpoint para obtener las estadísticas del dashboard del admin.
    """
    # Total de usuarios (¡Ahora usa CustomUser!)
    total_users = CustomUser.objects.count()
    active_users = CustomUser.objects.filter(is_active=True).count()
    inactive_users = CustomUser.objects.filter(is_active=False).count()

    # Últimas 5 sesiones
    latest_sessions = HistorialSesion.objects.select_related('usuario').order_by('-timestamp')[:5]
    formatted_latest_sessions = [
        {
            'username': s.usuario.username if s.usuario else 'Sistema',
            'event_type': s.get_accion_display(), 
            'timestamp': timezone.localtime(s.timestamp).strftime('%Y-%m-%d %H:%M:%S'),
            'ip_address': s.ip_address,
        } for s in latest_sessions
    ]

    # Últimas 5 acciones
    latest_actions = HistorialAccion.objects.select_related('usuario').order_by('-timestamp')[:5]
    formatted_latest_actions = [
        {
            'username': a.usuario.username if a.usuario else 'Sistema',
            'action_type': a.get_accion_display(), 
            'target_object_id': f"{a.content_type.model} (ID: {a.object_id})", 
            'timestamp': timezone.localtime(a.timestamp).strftime('%Y-%m-%d %H:%M:%S'),
        } for a in latest_actions
    ]

    data = {
        'total_users': total_users,
        'active_users': active_users,
        'inactive_users': inactive_users,
        'latest_sessions': formatted_latest_sessions,
        'latest_actions': formatted_latest_actions,
    }
    return Response(data, status=status.HTTP_200_OK)