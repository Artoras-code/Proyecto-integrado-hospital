from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp import devices_for_user

from .models import CustomUser
from auditoria.signals import registrar_login # signal de auditoría
from auditoria.mixins import AuditoriaMixin


from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth import login

# genera el QR en memoria
import qrcode
import qrcode.image.svg
import io
import base64

from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import action
from django_otp.plugins.otp_totp.models import TOTPDevice
from .serializers import UserSerializer


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
        
        # --- LÓGICA 2FA ---
        devices = list(devices_for_user(user))
        
        if not devices:
            # ¡Caso nuevo! El usuario es válido pero no tiene 2FA
            # Le enviamos un token temporal para que pueda configurar 2FA.
            # NO le damos un token de acceso completo.
            
            # (Nota: Usar un token JWT temporal aquí es más seguro,
            # pero por simplicidad, vamos a crear un "estado" para el frontend)
            
            # --- MODIFICACIÓN ---
            # En lugar de un error 403, devolvemos un nuevo "step"
            return Response(
                {"step": "2fa_setup_required", "username": user.username}, 
                status=status.HTTP_200_OK
            )

        # Si tiene dispositivos, continuamos al paso de verificación
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

        # Verificamos el token 2FA
        for device in devices_for_user(user):
            if device.verify_token(otp_token):
                # ¡Token válido! Generamos los tokens JWT
                refresh = RefreshToken.for_user(user)
                
                # Registramos el login en tu app 'auditoria'
                # (Necesitamos pasar el 'request' a la signal)
                try:
                    registrar_login(sender=CustomUser, request=request, user=user)
                except Exception as e:
                    # Opcional: manejar si la signal falla
                    print(f"Error al registrar login en auditoría: {e}")

                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'rol': user.rol,
                        'rut': user.rut, #
                    }
                }, status=status.HTTP_200_OK)
        
        # Si el loop termina, el token fue inválido
        return Response(
            {"error": "Código 2FA inválido"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


class Generate2FAAPIView(APIView):
    """
    API View para generar un nuevo dispositivo 2FA (TOTP).
    No requiere autenticación, solo un nombre de usuario válido
    que NO tenga 2FA configurado.
    """
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        if not username:
            return Response({"error": "Username requerido"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # Si el usuario YA tiene 2FA, no generamos uno nuevo.
        if list(devices_for_user(user)):
            return Response({"error": "Este usuario ya tiene 2FA configurado."}, status=status.HTTP_400_BAD_REQUEST)

        # Borrar dispositivos antiguos sin confirmar (si los hubiera)
        TOTPDevice.objects.filter(user=user, confirmed=False).delete()
        
        # Crear un nuevo dispositivo 2FA
        device = user.totpdevice_set.create(confirmed=False)
        
        # Generar el QR code como un string SVG
        img = qrcode.make(device.config_url, image_factory=qrcode.image.svg.SvgImage)
        buffer = io.BytesIO()
        img.save(buffer)
        
        # Convertir el SVG a un Data URL (Base64)
        svg_data = buffer.getvalue().decode()
        qr_code_data_url = f"data:image/svg+xml;base64,{base64.b64encode(svg_data.encode('utf-8')).decode('utf-8')}"

        return Response({
            "qr_code_data": qr_code_data_url,
            "secret_key": device.key  # Opcional, para mostrar "key"
        }, status=status.HTTP_200_OK)


class VerifySetup2FAAPIView(APIView):
    """
    API View para verificar y confirmar el 2FA por primera vez.
    Si tiene éxito, loguea al usuario y devuelve tokens JWT.
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

        # Encontrar el dispositivo NO CONFIRMADO que acabamos de generar
        device = user.totpdevice_set.filter(confirmed=False).first()
        
        if not device:
             return Response({"error": "No se encontró un dispositivo 2FA pendiente de configuración."}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar el token
        if device.verify_token(otp_token):
            # ¡Éxito! El token es válido, marcamos el dispositivo como confirmado
            device.confirmed = True
            device.save()
            
            try:
                # 'login' actualiza el last_login del usuario
                login(request, user) 
                registrar_login(sender=CustomUser, request=request, user=user)
            except Exception as e:
                print(f"Error al registrar login en auditoría: {e}")

            # Generar los tokens JWT
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
        
        # El token fue inválido
        return Response({"error": "Código 2FA inválido"}, status=status.HTTP_401_UNAUTHORIZED)

class UserViewSet(AuditoriaMixin,viewsets.ModelViewSet):
    """
    API endpoint que permite a los administradores ver, crear, editar y eliminar usuarios.
    """
    queryset = CustomUser.objects.all().order_by('username')
    serializer_class = UserSerializer
    # Solo los usuarios marcados como "is_staff" (admin en Django) pueden usar esto.
    permission_classes = [IsAdminUser] 

    @action(detail=True, methods=['post'], name='Reset 2FA')
    def reset_2fa(self, request, pk=None):
        """
        Acción personalizada para borrar los dispositivos 2FA de un usuario,
        forzándolo a reconfigurarlo en su próximo inicio de sesión.
        """
        try:
            user = self.get_object()
            # Borramos todos los dispositivos TOTP (Autenticador) de este usuario
            TOTPDevice.objects.filter(user=user).delete()
            # Registro para la auditoria
            self.registrar_accion(
                instance=user, 
                accion='modificacion', 
                detalles=f"Administrador reseteó el 2FA para el usuario {user.username}"
            )
            return Response(
                {'status': 'Dispositivos 2FA eliminados. El usuario deberá reconfigurar en el próximo login.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )