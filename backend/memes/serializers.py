# from rest_framework import serializers
# from evaluations.serializers import EvaluationSerializer
# from .models import Category, MemeTemplate, Meme
#
# class ImageURLMixin:
#     def get_image_url(self, obj):
#         try:
#             return obj.image.url  # Cloudinary secure_url
#         except Exception:
#             return None
#
# class MemeMinimalSerializer(serializers.ModelSerializer, ImageURLMixin):
#     image_url = serializers.SerializerMethodField()
#
#     class Meta:
#         model = Meme
#         fields = ["id", "image_url", "caption", "created_by", "format", "topic", "created_at", "template"]
#
#     def get_image_url(self, obj):  # override for MRO clarity
#         return super().get_image_url(obj)
#
# class MemeSerializer(serializers.ModelSerializer, ImageURLMixin):
#     image_url = serializers.SerializerMethodField()
#     evaluations = EvaluationSerializer(many=True, read_only=True)
#
#
# class MemeSerializer(serializers.ModelSerializer):
#     evaluations = EvaluationSerializer(many=True, read_only=True)
#     class Meta:
#         model = Meme
#         fields = "__all__"
#
#     def get_image_url(self, obj):
#         return super().get_image_url(obj)# from rest_framework import serializers
# # from evaluations.serializers import EvaluationSerializer
# # from .models import Category, MemeTemplate, Meme
# #
# # class ImageURLMixin:
# #     def get_image_url(self, obj):
# #         try:
# #             return obj.image.url  # Cloudinary secure_url
# #         except Exception:
# #             return None
# #
# # class MemeMinimalSerializer(serializers.ModelSerializer, ImageURLMixin):
# #     image_url = serializers.SerializerMethodField()
# #
# #     class Meta:
# #         model = Meme
# #         fields = ["id", "image_url", "caption", "created_by", "format", "topic", "created_at", "template"]
# #
# #     def get_image_url(self, obj):  # override for MRO clarity
# #         return super().get_image_url(obj)
# #
# # class MemeSerializer(serializers.ModelSerializer, ImageURLMixin):
# #     image_url = serializers.SerializerMethodField()
# #     evaluations = EvaluationSerializer(many=True, read_only=True)
# #
# #
# # class MemeSerializer(serializers.ModelSerializer):
# #     evaluations = EvaluationSerializer(many=True, read_only=True)
# #     class Meta:
# #         model = Meme
# #         fields = "__all__"
# #
# #     def get_image_url(self, obj):
# #         return super().get_image_url(obj)
# #
# # class MemeTemplateSerializer(serializers.ModelSerializer, ImageURLMixin):
# #     image_url = serializers.SerializerMethodField()
# #
# #     memes = MemeMinimalSerializer(many=True, read_only=True)
# #
# #
# # class MemeTemplateSerializer(serializers.ModelSerializer):
# #     memes = MemeSerializer(many=True, read_only=True)
# #     class Meta:
# #         model = MemeTemplate
# #         fields = "__all__"
# #
# #     def get_image_url(self, obj):
# #         return super().get_image_url(obj)
# #
# # class CategorySerializer(serializers.ModelSerializer):
# #     templates = MemeTemplateSerializer(many=True, read_only=True)
# #
# #     class Meta:
# #         model = Category
# #         fields = "__all__"
#
# class MemeTemplateSerializer(serializers.ModelSerializer, ImageURLMixin):
#     image_url = serializers.SerializerMethodField()
#
#     memes = MemeMinimalSerializer(many=True, read_only=True)
#
#
# class MemeTemplateSerializer(serializers.ModelSerializer):
#     memes = MemeSerializer(many=True, read_only=True)
#     class Meta:
#         model = MemeTemplate
#         fields = "__all__"
#
#     def get_image_url(self, obj):
#         return super().get_image_url(obj)
#
# class CategorySerializer(serializers.ModelSerializer):
#     templates = MemeTemplateSerializer(many=True, read_only=True)
#
#     class Meta:
#         model = Category
#         fields = "__all__"



from rest_framework import serializers
from evaluations.serializers import EvaluationSerializer
from .models import Category, MemeTemplate, Meme

# -------------------------
# Mixins
# -------------------------
class ImageURLMixin:
    def get_image_url(self, obj):
        try:
            return obj.image.url  # Cloudinary secure_url
        except:
            return None


# -------------------------
# Meme Minimal Serializer
# -------------------------
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
        return super().get_image_url(obj)


# -------------------------
# Meme Full Serializer
# -------------------------
class MemeSerializer(serializers.ModelSerializer, ImageURLMixin):
    image_url = serializers.SerializerMethodField()
    evaluations = EvaluationSerializer(many=True, read_only=True)

    class Meta:
        model = Meme
        fields = "__all__"

    def get_image_url(self, obj):
        return super().get_image_url(obj)


# -------------------------
# Meme Template Serializer
# -------------------------
class MemeTemplateSerializer(serializers.ModelSerializer, ImageURLMixin):
    image_url = serializers.SerializerMethodField()
    memes = MemeMinimalSerializer(many=True, read_only=True)

    class Meta:
        model = MemeTemplate
        fields = "__all__"

    def get_image_url(self, obj):
        return super().get_image_url(obj)


# -------------------------
# Category Serializer
# -------------------------
class CategorySerializer(serializers.ModelSerializer):
    templates = MemeTemplateSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = "__all__"
