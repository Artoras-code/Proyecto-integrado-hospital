from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import CustomUser

class IsSupervisorUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.rol == CustomUser.SUPERVISOR

class IsClinicoUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and
            (request.user.rol == CustomUser.DOCTOR or request.user.rol == CustomUser.ENFERMERO)
        )

class IsSupervisorOrClinicoCreateRead(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False


        if request.user.rol == CustomUser.SUPERVISOR:
            return True
        

        if request.user.rol == CustomUser.DOCTOR or request.user.rol == CustomUser.ENFERMERO:
            return request.method in (SAFE_METHODS + ('POST',))
    
        return False