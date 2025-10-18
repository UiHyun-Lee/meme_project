from rest_framework import serializers
from evaluations.serializers import EvaluationSerializer
from .models import Category, MemeTemplate, Meme


class MemeSerializer(serializers.ModelSerializer):
    evaluations = EvaluationSerializer(many=True, read_only=True)
    class Meta:
        model = Meme
        fields = "__all__"


class MemeTemplateSerializer(serializers.ModelSerializer):
    memes = MemeSerializer(many=True, read_only=True)
    class Meta:
        model = MemeTemplate
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    templates = MemeTemplateSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = "__all__"