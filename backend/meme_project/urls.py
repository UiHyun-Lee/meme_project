from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from memes.views import (
    CategoryViewSet,
    MemeTemplateViewSet,
    MemeViewSet,
    generate_ai_meme,
    generate_multiple_ai_memes,
    import_cloudinary_data,
    UserMemeUploadView,
    report_meme,
    random_memes,
    vote_meme,
    leaderboard,
    current_topic_view,
)
from evaluations.views import EvaluationViewSet
from memes.auth_views import GoogleLoginView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django.conf import settings
from django.conf.urls.static import static


# Router for basic CRUD APIs
router = routers.DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'templates', MemeTemplateViewSet)
router.register(r'memes', MemeViewSet)
router.register(r'evaluations', EvaluationViewSet)

# Optional: expose template list separately
template_list = MemeTemplateViewSet.as_view({"get": "list"})


urlpatterns = [
    path('admin/', admin.site.urls),

    # Legacy endpoint (keep if frontend is already using it)
    path("api/generate_ai_meme/", generate_ai_meme),

    # REST-style AI generation endpoint (recommended)
    path("api/memes/ai-generate/", generate_ai_meme),

    # Generate multiple AI memes across multiple templates
    path("api/memes/ai-generate/multiple/", generate_multiple_ai_memes),


    # Cloudinary Import
    path('api/import-cloudinary/', import_cloudinary_data),

    # Template listing (from Cloudinary or DB)
    path('api/cloudinary-templates/', template_list, name='cloudinary-templates'),


    # User Meme Upload
    path('api/user-memes/', UserMemeUploadView.as_view()),



    # Get the currently active weekly topic
    path("api/memes/topic/current/", current_topic_view),

    # Random human vs AI meme for voting (same topic only)
    path('api/memes/random/', random_memes),

    # Vote for a meme
    path('api/memes/vote/', vote_meme),

    # Report a meme
    path('api/memes/report/', report_meme),

    # Leaderboard sorted by votes
    path('api/leaderboard/', leaderboard),


    # Google Login
    path("auth/google/", GoogleLoginView.as_view(), name="google-login"),


    # CRUD Routers
    path('api/', include(router.urls)),


    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]


# Media files (local development)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
