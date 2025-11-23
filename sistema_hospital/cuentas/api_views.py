from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp import devices_for_user
from django_otp.plugins.otp_totp.models import TOTPDevice

from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.utils import timezone
from auditoria.models import HistorialSesion, HistorialAccion
from auditoria.signals import registrar_login
from auditoria.mixins import AuditoriaMixin

import qrcode
import qrcode.image.svg
import io
import base64


from .models import CustomUser, Equipo, SolicitudClave
from .serializers import (
    UserSerializer, 
    EquipoSerializer, 
    UserOptionSerializer, 
    SolicitudClaveSerializer
)

from .permissions import IsDoctorUser, IsAdminRol

User = get_user_model()


class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "Ingrese usuario y contraseña"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if not user:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({"error": "Usuario inactivo"}, status=status.HTTP_401_UNAUTHORIZED)

        devices = list(devices_for_user(user))
        
        if not devices:
            return Response({"step": "2fa_setup_required", "username": user.username}, status=status.HTTP_200_OK)

        return Response({"step": "2fa_required", "username": user.username}, status=status.HTTP_200_OK)


class Verify2FAAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        otp_token = request.data.get('otp_token')

        if not username or not otp_token:
            return Response({"error": "Faltan datos"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

        for device in devices_for_user(user):
            if device.verify_token(otp_token):
                refresh = RefreshToken.for_user(user)
                try:
                    registrar_login(sender=User, request=request, user=user)
                except Exception:
                    pass

                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'rol': user.rol,
                        'rut': user.rut, 
                        'nombre': f"{user.first_name} {user.last_name}".strip() or user.username
                    }
                }, status=status.HTTP_200_OK)
        
        return Response({"error": "Código 2FA inválido"}, status=status.HTTP_401_UNAUTHORIZED)


class Generate2FAAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

        TOTPDevice.objects.filter(user=user, confirmed=False).delete()
        device = user.totpdevice_set.create(confirmed=False)
        
        img = qrcode.make(device.config_url, image_factory=qrcode.image.svg.SvgImage)
        buffer = io.BytesIO()
        img.save(buffer)
        
        svg_data = buffer.getvalue().decode()
        qr_code = f"data:image/svg+xml;base64,{base64.b64encode(svg_data.encode('utf-8')).decode('utf-8')}"

        return Response({"qr_code_data": qr_code, "secret_key": device.key}, status=200)


class VerifySetup2FAAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        otp_token = request.data.get('otp_token')
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

        device = user.totpdevice_set.filter(confirmed=False).first()
        if not device:
             return Response({"error": "No hay configuración pendiente"}, status=400)

        if device.verify_token(otp_token):
            device.confirmed = True
            device.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'rol': user.rol,
                }
            }, status=200)
        
        return Response({"error": "Código inválido"}, status=401)


class SolicitarCambioClaveView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        try:
            user = User.objects.get(username=username)
            if not SolicitudClave.objects.filter(usuario=user, resuelta=False).exists():
                SolicitudClave.objects.create(usuario=user)
            return Response({"message": "Solicitud enviada. Contacte al administrador."}, status=200)
        except User.DoesNotExist:
            return Response({"message": "Solicitud enviada."}, status=200)




class UserViewSet(AuditoriaMixin, viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAdminRol]

    @action(detail=True, methods=['post'])
    def reset_2fa(self, request, pk=None):
        user = self.get_object()
        TOTPDevice.objects.filter(user=user).delete()
        self.registrar_accion(user, 'modificacion', f"Admin reseteó 2FA de {user.username}")
        return Response({'status': '2FA eliminado'}, status=200)

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        estado = "activado" if user.is_active else "desactivado"
        self.registrar_accion(user, 'modificacion', f"Admin {estado} al usuario {user.username}")
        return Response({'status': estado, 'is_active': user.is_active})


class SolicitudClaveViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SolicitudClave.objects.filter(resuelta=False).order_by('-fecha_solicitud')
    serializer_class = SolicitudClaveSerializer
    permission_classes = [IsAuthenticated, IsAdminRol]

    @action(detail=True, methods=['post'])
    def marcar_resuelta(self, request, pk=None):
        solicitud = self.get_object()
        solicitud.resuelta = True
        solicitud.save()
        return Response({"status": "resuelta"})


class EquipoViewSet(viewsets.ModelViewSet):
    serializer_class = EquipoSerializer
    permission_classes = [IsAuthenticated] 

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'activar']:
            return [IsAuthenticated(), IsDoctorUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.rol == CustomUser.DOCTOR:
            return Equipo.objects.filter(lider=user).order_by('-created_at')
        return Equipo.objects.filter(miembros=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(lider=self.request.user)

    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        equipo = self.get_object()
        Equipo.objects.filter(lider=request.user, turno=equipo.turno, activo=True).update(activo=False)
        equipo.activo = True
        equipo.save()
        return Response({'status': 'Equipo activado'})


class UserOptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserOptionSerializer
    permission_classes = [IsAuthenticated, IsDoctorUser]

    def get_queryset(self):
        return User.objects.filter(rol='enfermero', is_active=True).order_by('username')


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminRol])
def dashboard_stats(request):
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    inactive_users = total_users - active_users
    
    latest_sessions = HistorialSesion.objects.select_related('usuario').order_by('-timestamp')[:5]
    fmt_sessions = []
    for s in latest_sessions:
        fmt_sessions.append({
            'username': s.usuario.username if s.usuario else 'Sistema',
            'event_type': s.get_accion_display(),
            'timestamp': s.timestamp.strftime('%d/%m/%Y %H:%M'),
            'ip_address': s.ip_address
        })

    latest_actions = HistorialAccion.objects.select_related('usuario', 'content_type').order_by('-timestamp')[:5]
    fmt_actions = []
    for a in latest_actions:
        fmt_actions.append({
            'username': a.usuario.username if a.usuario else 'Sistema',
            'action_type': a.get_accion_display(),
            'target_object_id': f"{a.content_type.model} (ID: {a.object_id})",
            'timestamp': a.timestamp.strftime('%d/%m/%Y %H:%M')
        })

    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'inactive_users': inactive_users,
        'latest_sessions': fmt_sessions,
        'latest_actions': fmt_actions,
    })