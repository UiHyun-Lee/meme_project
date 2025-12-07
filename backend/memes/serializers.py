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



# from rest_framework import serializers
# from evaluations.serializers import EvaluationSerializer
# from .models import Category, MemeTemplate, Meme
# from cloudinary.utils import cloudinary_url
#
# # -------------------------
# # Mixins
# # -------------------------
# class ImageURLMixin:
#     def _build_image_url(self, obj):
#         image = getattr(obj, "image", None)
#         if not image:
#             return None
#
#         value = str(image)
#
#         if value.startswith("http://") or value.startswith("https://"):
#             return value
#
#         url, _ = cloudinary_url(value)
#         return url
#
#
# # -------------------------
# # Meme Minimal Serializer
# # -------------------------
# class MemeMinimalSerializer(serializers.ModelSerializer, ImageURLMixin):
#     image_url = serializers.SerializerMethodField()
#
#     class Meta:
#         model = Meme
#         fields = [
#             "id",
#             "image_url",
#             "caption",
#             "created_by",
#             "format",
#             "topic",
#             "created_at",
#         ]
#
#     def get_image_url(self, obj):
#         return self._build_image_url(obj)
#
#
# # -------------------------
# # Meme Full Serializer
# # -------------------------
# class MemeSerializer(serializers.ModelSerializer, ImageURLMixin):
#     # image 필드를 URL로 덮어쓰고, image_url도 같이 내려줌
#     image = serializers.SerializerMethodField()
#     image_url = serializers.SerializerMethodField()
#     evaluations = EvaluationSerializer(many=True, read_only=True)
#
#     class Meta:
#         model = Meme
#         fields = "__all__"   # 여기에는 model의 image 필드 대신 우리가 정의한 method field image가 사용됨
#
#     def get_image(self, obj):
#         # 프론트에서 entry.image 로 써도 항상 URL이 나가도록
#         return self._build_image_url(obj)
#
#     def get_image_url(self, obj):
#         # 혹시 다른 곳에서 image_url 쓰는 코드도 호환
#         return self._build_image_url(obj)
#
#
# # -------------------------
# # Meme Template Serializer
# # -------------------------
# class MemeTemplateSerializer(serializers.ModelSerializer, ImageURLMixin):
#     image_url = serializers.SerializerMethodField()
#     memes = MemeMinimalSerializer(many=True, read_only=True)
#
#     class Meta:
#         model = MemeTemplate
#         fields = "__all__"
#
#     def get_image_url(self, obj):
#         return self._build_image_url(obj)
#
#
# # -------------------------
# # Category Serializer
# # -------------------------
# class CategorySerializer(serializers.ModelSerializer):
#     templates = MemeTemplateSerializer(many=True, read_only=True)
#
#     class Meta:
#         model = Category
#         fields = "__all__"


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
