# """
# URL configuration for meme_project project.
#
# The `urlpatterns` list routes URLs to views. For more information please see:
#     https://docs.djangoproject.com/en/4.2/topics/http/urls/
# Examples:
# Function views
#     1. Add an import:  from my_app import views
#     2. Add a URL to urlpatterns:  path('', views.home, name='home')
# Class-based views
#     1. Add an import:  from other_app.views import Home
#     2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
# Including another URLconf
#     1. Import the include() function: from django.urls import include, path
#     2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
# """
#
# from django.contrib import admin
# from django.urls import path, include
# from rest_framework import routers
# from memes.views import CategoryViewSet, MemeTemplateViewSet, MemeViewSet, generate_ai_meme, import_cloudinary_data, \
#     UserMemeUploadView, list_or_import_cloudinary_templates, report_meme, random_memes, vote_meme, leaderboard
# from evaluations.views import EvaluationViewSet
# from memes.auth_views import GoogleLoginView
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )
# from django.conf import settings
# from django.conf.urls.static import static
#
# router = routers.DefaultRouter()
#
# router.register(r'categories', CategoryViewSet)
# router.register(r'templates', MemeTemplateViewSet)
# router.register(r'memes', MemeViewSet)
# router.register(r'evaluations', EvaluationViewSet)
#
# urlpatterns = [
#     path('admin/', admin.site.urls),
#
#     path("api/generate_ai_meme/", generate_ai_meme),
#     path('api/import-cloudinary/', import_cloudinary_data),
#     path('api/cloudinary-templates/', list_or_import_cloudinary_templates),
#
#     path('api/user-memes/', UserMemeUploadView.as_view()),
#
#     path('api/memes/random/', random_memes),
#     path('api/memes/vote/', vote_meme),
#     path('api/memes/report/', report_meme),
#     path('api/leaderboard/', leaderboard),
#     path("auth/google/", GoogleLoginView.as_view(), name="google-login"),
#     path('api/', include(router.urls)),
#     # JWT
#     path('api/token/', TokenObtainPairView.as_view(), name='token_obtain'),
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
# ]
#
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from memes.views import (
    CategoryViewSet,
    MemeTemplateViewSet,
    MemeViewSet,
    generate_ai_meme,
    import_cloudinary_data,
    UserMemeUploadView,
    report_meme,
    random_memes,
    vote_meme,
    leaderboard,
)
from evaluations.views import EvaluationViewSet
from memes.auth_views import GoogleLoginView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'templates', MemeTemplateViewSet)
router.register(r'memes', MemeViewSet)
router.register(r'evaluations', EvaluationViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),

    # AI 생성
    path("api/generate_ai_meme/", generate_ai_meme),

    # Cloudinary import
    path('api/import-cloudinary/', import_cloudinary_data),

    # 사용자 밈 업로드
    path('api/user-memes/', UserMemeUploadView.as_view()),

    # 랜덤 밈 / 투표 / 신고 / 리더보드
    path('api/memes/random/', random_memes),
    path('api/memes/vote/', vote_meme),
    path('api/memes/report/', report_meme),
    path('api/leaderboard/', leaderboard),

    # Google Login
    path("auth/google/", GoogleLoginView.as_view(), name="google-login"),

    # Routers
    path('api/', include(router.urls)),

    # JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
