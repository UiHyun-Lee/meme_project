from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.conf import settings

from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

User = get_user_model()


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        id_token_value = request.data.get("id_token")
        if not id_token_value:
            return Response({"error": "id_token required"}, status=400)

        try:
            # token check
            idinfo = id_token.verify_oauth2_token(
                id_token_value,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )

            email = idinfo.get("email")
            name = idinfo.get("name", "")
            picture = idinfo.get("picture", "")

            if not email:
                return Response({"error": "Google token has no email"}, status=400)

            # user create
            user, created = User.objects.get_or_create(
                email=email,
                defaults={"username": email.split("@")[0], "first_name": name},
            )

            # JWT
            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "email": email,
                "name": name,
                "picture": picture,
            })

        except Exception as e:
            print("Google Login error:", e)
            return Response({"error": "Invalid Google token"}, status=400)
