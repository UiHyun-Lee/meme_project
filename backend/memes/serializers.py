from rest_framework import serializers
from .models import Meme

class MemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meme
        fields = [
            'id',          # PK
            'image_url',
            'caption',
            'created_by',
            'format',
            'topic',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']