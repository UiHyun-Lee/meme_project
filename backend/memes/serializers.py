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
from cloudinary.utils import cloudinary_url   # ✅ 추가
from .models import Category, MemeTemplate, Meme


# -------------------------
# Mixins
# -------------------------
class ImageURLMixin:
    def _build_image_url(self, obj):
        """
        Meme / MemeTemplate 의 image 필드가
        - 이미 https://... 풀 URL 이든
        - Cloudinary public_id (예: "memes/ai/xxxx") 이든
        항상 최종적으로 쓸 수 있는 URL 로 바꿔서 리턴.
        """
        image = getattr(obj, "image", None)
        if not image:
            return None

        value = str(image)

        # 이미 완전한 URL이면 그대로 사용
        if value.startswith("http://") or value.startswith("https://"):
            return value

        # 나머지는 Cloudinary public_id 로 보고 URL 생성
        url, _ = cloudinary_url(value)
        return url


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
        return self._build_image_url(obj)


# -------------------------
# Meme Full Serializer
# -------------------------
class MemeSerializer(serializers.ModelSerializer, ImageURLMixin):
    # ✅ 프론트에서 entry.image 써도 항상 URL 나오게
    image = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    evaluations = EvaluationSerializer(many=True, read_only=True)

    class Meta:
        model = Meme
        fields = "__all__"

    def get_image(self, obj):
        # /api/leaderboard 의 "image" 필드
        return self._build_image_url(obj)

    def get_image_url(self, obj):
        # 혹시 다른 곳에서 image_url 쓰는 경우 호환용
        return self._build_image_url(obj)


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
        return self._build_image_url(obj)


# -------------------------
# Category Serializer
# -------------------------
class CategorySerializer(serializers.ModelSerializer):
    templates = MemeTemplateSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = "__all__"
