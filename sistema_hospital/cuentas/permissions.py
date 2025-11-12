from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import CustomUser

class IsSupervisorUser(BasePermission):
    """
    Permite el acceso solo a usuarios con el rol de Supervisor.
    """
    def has_permission(self, request, view):
        # request.user se obtiene del token JWT
        return request.user and request.user.rol == CustomUser.SUPERVISOR

class IsClinicoUser(BasePermission):
    """
    Permite el acceso a roles clínicos (Doctor o Enfermero).
    """
    def has_permission(self, request, view):
        return (
            request.user and
            (request.user.rol == CustomUser.DOCTOR or request.user.rol == CustomUser.ENFERMERO)
        )

# --- ¡NUEVO PERMISO PARA PARÁMETROS! ---
class IsSupervisorOrReadOnlyClinico(BasePermission):
    """
    Permiso personalizado:
    - Supervisores: Tienen permiso completo (CRUD).
    - Clínicos (Doctor, Enfermero): Tienen permiso de solo lectura (GET, HEAD, OPTIONS).
    - Otros: No tienen permiso.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Supervisores tienen permiso completo
        if request.user.rol == CustomUser.SUPERVISOR:
            return True
        
        # Clínicos tienen permiso solo para métodos seguros (GET)
        if request.user.rol == CustomUser.DOCTOR or request.user.rol == CustomUser.ENFERMERO:
            return request.method in SAFE_METHODS
        
        # Otros roles (como admin) no tienen acceso
        return False

# --- ¡NUEVO PERMISO PARA MADRE Y RN! ---
class IsSupervisorOrClinicoCreateRead(BasePermission):
    """
    Permiso personalizado:
    - Supervisores: Tienen permiso completo (CRUD).
    - Clínicos (Doctor, Enfermero): Tienen permiso para LEER y CREAR (GET, POST).
    - Otros: No tienen permiso.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Supervisores tienen permiso completo
        if request.user.rol == CustomUser.SUPERVISOR:
            return True
        
        # Clínicos tienen permiso para métodos seguros (GET) y para CREAR (POST)
        if request.user.rol == CustomUser.DOCTOR or request.user.rol == CustomUser.ENFERMERO:
            return request.method in (SAFE_METHODS + ('POST',))
        
        # Otros roles (como admin) no tienen acceso
        return False