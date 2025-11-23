from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import CustomUser

class IsSupervisorUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == CustomUser.SUPERVISOR)

class IsClinicoUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                   (request.user.rol == CustomUser.ENFERMERO or request.user.rol == CustomUser.DOCTOR))

class IsDoctorUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == CustomUser.DOCTOR)

class IsAdminRol(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == CustomUser.ADMIN)

class IsSupervisorOrClinicoCreateRead(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.rol == CustomUser.SUPERVISOR:
            return True

        if request.user.rol == CustomUser.DOCTOR or request.user.rol == CustomUser.ENFERMERO:
            return request.method in (SAFE_METHODS + ('POST', 'DELETE'))
    
        return False