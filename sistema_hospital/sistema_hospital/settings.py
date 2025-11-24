import os
from pathlib import Path
from decouple import config
import dj_database_url
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- SEGURIDAD ---
# Lee la clave del entorno (Render), si no busca en .env (Local), si no usa la insegura (Solo dev)
SECRET_KEY = os.environ.get('SECRET_KEY', config('SECRET_KEY', default='django-insecure-dev-key'))

# En producción (Render) DEBUG será False. En local será True (si no existe la variable RENDER).
DEBUG = 'RENDER' not in os.environ

# Configuración de Hosts permitidos
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='127.0.0.1').split(',')

# Agregar automáticamente el host que asigne Render
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)


# --- APLICACIONES INSTALADAS ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Librerías de terceros
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Tus aplicaciones
    'cuentas',
    'dashboard',
    'auditoria',
    
    # Autenticación de Dos Pasos (2FA)
    'django_otp',
    'django_otp.plugins.otp_static',
    'django_otp.plugins.otp_totp',
    'two_factor',
]

# --- MIDDLEWARE ---
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',                   # CORS debe ir al principio
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',              # WhiteNoise para archivos estáticos
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django_otp.middleware.OTPMiddleware',                     # Middleware de 2FA
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sistema_hospital.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sistema_hospital.wsgi.application'


# --- BASE DE DATOS ---
# Usa la base de datos de Render (PostgreSQL) en producción, o SQLite en local
DATABASES = {
    'default': dj_database_url.config(
        # Busca la variable DATABASE_URL. Si no la encuentra, usa sqlite local.
        default=config('DATABASE_URL', default='sqlite:///db.sqlite3'),
        conn_max_age=600
    )
}


# --- VALIDACIÓN DE CONTRASEÑAS ---
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]


# --- USUARIO PERSONALIZADO ---
AUTH_USER_MODEL = 'cuentas.CustomUser'

# --- REDIRECCIONES LOGIN ---
LOGIN_URL = 'two_factor:login'
LOGIN_REDIRECT_URL = 'cuentas:redirect'
LOGOUT_REDIRECT_URL = 'two_factor:login'


# --- INTERNACIONALIZACIÓN ---
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# --- ARCHIVOS ESTÁTICOS ---
STATIC_URL = 'static/'

if not DEBUG:
    # Configuración para producción (Render)
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# --- CONFIGURACIÓN GENERAL ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
SESSION_COOKIE_AGE = 1300


# --- DRF & JWT ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 15,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}


# --- CORS (Conexión con Frontend) ---
CORS_ALLOW_ALL_ORIGINS = True

# Si tienes problemas de conexión al principio, puedes descomentar esto temporalmente:
# CORS_ALLOW_ALL_ORIGINS = True
