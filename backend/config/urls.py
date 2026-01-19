"""
URL Configuration for premium_edu_platform
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# API Documentation
schema_view = get_schema_view(
    openapi.Info(
        title="Premium Educational Platform API",
        default_version='v1',
        description="Comprehensive Educational Management System API",
        terms_of_service="https://www.premiumedu.com/terms/",
        contact=openapi.Contact(email="api@premiumedu.com"),
        license=openapi.License(name="Proprietary License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API Endpoints
    path('api/v1/accounts/', include('apps.accounts.urls')),
    path('api/v1/schools/', include('apps.schools.urls')),
    path('api/v1/lectures/', include('apps.lectures.urls')),
    path('api/v1/notes/', include('apps.notes.urls')),
    path('api/v1/flashcards/', include('apps.flashcards.urls')),
    path('api/v1/assignments/', include('apps.assignments.urls')),
    path('api/v1/assessments/', include('apps.assessments.urls')),
    path('api/v1/gamification/', include('apps.gamification.urls')),
    path('api/v1/attendance/', include('apps.attendance.urls')),
    path('api/v1/performance/', include('apps.performance.urls')),
    path('api/v1/communication/', include('apps.communication.urls')),
    path('api/v1/behavior/', include('apps.behavior.urls')),
    path('api/v1/resources/', include('apps.resources.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Debug Toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns

# Customize admin site
admin.site.site_header = "Premium Educational Platform Admin"
admin.site.site_title = "Premium Edu Admin"
admin.site.index_title = "Welcome to Premium Educational Platform Administration"
