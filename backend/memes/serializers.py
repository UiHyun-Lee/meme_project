from rest_framework import serializers
from evaluations.serializers import EvaluationSerializer
from cloudinary.utils import cloudinary_url
from .models import Category, MemeTemplate, Meme


class ImageURLMixin:
    def _build_image_url(self, obj):

        image = getattr(obj, "image", None)
        if not image:
            return None

        value = str(image)

        if value.startswith("http://") or value.startswith("https://"):
            return value

        url, _ = cloudinary_url(value)
        return url

class MemeMinimalSerializer(serializers.ModelSerializer, ImageURLMixin):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Meme
        fields = [
            "id",
            "image_url",
            "caption",
            "created_by",
            "format",
            "topic",
            "created_at",
        ]

    def get_image_url(self, obj):
        return self._build_image_url(obj)


class MemeSerializer(serializers.ModelSerializer, ImageURLMixin):
    image = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    evaluations = EvaluationSerializer(many=True, read_only=True)

    class Meta:
        model = Meme
        fields = "__all__"

    def get_image(self, obj):
        return self._build_image_url(obj)

    def get_image_url(self, obj):
        return self._build_image_url(obj)


class MemeTemplateSerializer(serializers.ModelSerializer, ImageURLMixin):
    image_url = serializers.SerializerMethodField()
    memes = MemeMinimalSerializer(many=True, read_only=True)

    class Meta:
        model = MemeTemplate
        fields = "__all__"

    def get_image_url(self, obj):
        return self._build_image_url(obj)


class CategorySerializer(serializers.ModelSerializer):
    templates = MemeTemplateSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = "__all__"
