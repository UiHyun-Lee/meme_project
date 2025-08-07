# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Meme
from .serializers import MemeSerializer

class MemeViewSet(viewsets.ModelViewSet):
    queryset = Meme.objects.all().order_by('-created_at')
    serializer_class = MemeSerializer
    permission_classes = [AllowAny]  # if needed modify IsAuthenticated
