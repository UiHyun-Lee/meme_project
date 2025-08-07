from rest_framework import serializers
from .models import Evaluation

class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = [
            'id',
            'meme',           # Meme FK
            'humor_score',
            'cultural_score',
            'creativity_score',
            'comment',
            'user_id',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']