from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Equipo


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    

    fieldsets = UserAdmin.fieldsets + (
        ('Información del Hospital', {'fields': ('rol', 'rut')}),
    )
    

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información del Hospital', {'fields': ('rol', 'rut')}),
    )
    

    list_display = ['username', 'first_name', 'last_name', 'rol', 'is_active']
    list_filter = ['rol', 'is_active']


admin.site.register(CustomUser, CustomUserAdmin)

@admin.register(Equipo)
class EquipoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'lider', 'turno', 'activo')
    filter_horizontal = ('miembros',)
    list_filter = ('turno', 'activo')
    search_fields = ('nombre', 'lider__username')