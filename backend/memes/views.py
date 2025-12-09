# from rest_framework import viewsets, status
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.permissions import IsAdminUser, AllowAny
# from rest_framework.views import APIView
#
# from .models import Category, MemeTemplate, Meme
# from .serializers import CategorySerializer, MemeTemplateSerializer, MemeSerializer
# from .services import generate_ai_meme_design, apply_ai_text_to_image
#
# import cloudinary
# import cloudinary.api
# import cloudinary.uploader
# import os
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import status
# from openai import OpenAI
# from django.conf import settings
# from django.shortcuts import get_object_or_404
#
# client = OpenAI(api_key=settings.OPENAI_API_KEY)
#
# # Cloudinary 설정
# cloudinary.config(
#     cloud_name=os.getenv("CLOUDINARY_NAME"),
#     api_key=os.getenv("CLOUDINARY_API_KEY"),
#     api_secret=os.getenv("CLOUDINARY_API_SECRET"),
# )
#
#
# # =========================
# # Category / Template / Meme CRUD
# # =========================
#
# class CategoryViewSet(viewsets.ModelViewSet):
#     queryset = Category.objects.all()
#     serializer_class = CategorySerializer
#
#
# class MemeTemplateViewSet(viewsets.ModelViewSet):
#     queryset = MemeTemplate.objects.all()
#     serializer_class = MemeTemplateSerializer
#
#
# class MemeViewSet(viewsets.ModelViewSet):
#     queryset = Meme.objects.all().order_by("-created_at")
#     serializer_class = MemeSerializer
#
#
#
#
# @api_view(["POST"])
# def generate_ai_meme(request):
#     template_id = request.data.get("template")
#     if not template_id:
#         return Response(
#             {"error": "template id required"},
#             status=status.HTTP_400_BAD_REQUEST,
#         )
#
#     template = get_object_or_404(MemeTemplate, id=template_id)
#
#     category_name = template.category.name if template.category else ""
#     template_desc = template.description or ""
#
#     try:
#         template_image_url = template.image.url
#     except Exception:
#         return Response(
#             {"error": "Template image URL missing"},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         )
#
#     # 1) AI caption + style config
#     design = generate_ai_meme_design(
#         category_name=category_name,
#         template_desc=template_desc,
#         template_url=template_image_url,
#     )
#
#     if "error" in design:
#         return Response(design, status=status.HTTP_502_BAD_GATEWAY)
#
#     captions = design.get("captions") or []
#     if not captions:
#         return Response(
#             {"error": "No captions generated from AI"},
#             status=status.HTTP_502_BAD_GATEWAY,
#         )
#
#     try:
#         public_id = apply_ai_text_to_image(template_image_url, captions)
#     except Exception as e:
#         print("apply_ai_text_to_image error:", repr(e))
#         return Response(
#             {"error": "image_generation_failed", "detail": str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         )
#
#     try:
#         meme = Meme.objects.create(
#             template=template,
#             image=public_id,              # CloudinaryField → public_id
#             caption="; ".join([str(c.get("text", "")) for c in captions]),
#             created_by="ai",
#             format="macro",
#             topic=category_name or None,
#         )
#     except Exception as e:
#         print("Meme create error:", repr(e))
#         return Response(
#             {"error": "db_create_failed", "detail": str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         )
#
#     serializer = MemeSerializer(meme)
#     return Response(serializer.data, status=status.HTTP_201_CREATED)
#
#
# @api_view(["POST"])
# @permission_classes([AllowAny])
# def import_cloudinary_data(request):
#     folder = request.data.get("folder") or ""
#     type_ = request.data.get("type", "template")
#     topic = request.data.get("topic", "")
#     category_name = request.data.get("category", "General")
#
#     if not folder:
#         return Response({"error": "folder required"}, status=400)
#
#     category, _ = Category.objects.get_or_create(name=category_name)
#
#     imported = 0
#     skipped = 0
#     next_cursor = None
#
#     while True:
#         try:
#             resp = cloudinary.api.resources(
#                 type="upload",
#                 prefix=folder,
#                 max_results=100,
#                 next_cursor=next_cursor,
#             )
#         except Exception as e:
#             return Response({"error": str(e)}, status=500)
#
#         resources = resp.get("resources", [])
#         if not resources and not resp.get("next_cursor"):
#             break
#
#         for res in resources:
#             url = res.get("secure_url")
#             if not url:
#                 continue
#
#             # Template import
#             if type_ == "template":
#                 if MemeTemplate.objects.filter(image=url).exists():
#                     skipped += 1
#                     continue
#
#                 MemeTemplate.objects.create(
#                     category=category,
#                     image=url,
#                     description="Imported from Cloudinary",
#                 )
#                 imported += 1
#
#             # Meme import
#             elif type_ == "meme":
#                 if Meme.objects.filter(image=url).exists():
#                     skipped += 1
#                     continue
#
#                 lower = url.lower()
#
#                 creator = "ai" if "/memes/ai/" in lower else "human"
#                 caption = "AI generated meme" if creator == "ai" else "User meme"
#
#                 Meme.objects.create(
#                     template=None,
#                     image=url,
#                     caption=caption,
#                     created_by=creator,
#                     format="macro",
#                     topic=topic,
#                 )
#                 imported += 1
#
#         next_cursor = resp.get("next_cursor")
#         if not next_cursor:
#             break
#
#     return Response(
#         {
#             "imported": imported,
#             "skipped_duplicates": skipped,
#             "folder": folder,
#             "type": type_,
#         },
#         status=201,
#     )
#
# class UserMemeUploadView(APIView):
#     parser_classes = [MultiPartParser, FormParser]
#
#     def post(self, request):
#         file_obj = request.FILES.get("image_file")
#         if not file_obj:
#             return Response({"error": "image_file required"}, status=400)
#
#         caption = request.data.get("caption", "")
#         topic = request.data.get("topic", "")
#         template_id = request.data.get("template_id")
#
#         template = None
#         if template_id:
#             try:
#                 if template_id.isdigit():
#                     template = MemeTemplate.objects.get(id=int(template_id))
#                 else:
#                     template = MemeTemplate.objects.filter(
#                         image__icontains=template_id
#                     ).first()
#             except MemeTemplate.DoesNotExist:
#                 return Response({"error": "template not found"}, status=404)
#         else:
#             template = MemeTemplate.objects.first()
#
#         if not topic and template:
#             topic = template.category.name
#
#         # Cloudinary upload
#         upload_result = cloudinary.uploader.upload(
#             file_obj,
#             folder="memes/human/",
#             resource_type="image",
#         )
#
#         format_value = request.data.get("format") or (
#             template.description if template else "macro"
#         )
#
#         meme = Meme.objects.create(
#             template=template,
#             image=upload_result["secure_url"],
#             caption=caption,
#             created_by="human",
#             format=format_value,
#             topic=topic,
#         )
#
#         return Response(MemeSerializer(meme).data, status=201)
#
# @api_view(["GET"])
# def random_memes(request):
#     human_qs = Meme.objects.filter(created_by="human").exclude(image="")
#     ai_qs = Meme.objects.filter(created_by="ai").exclude(image="")
#
#     import random
#     if not human_qs.exists() or not ai_qs.exists():
#         return Response({"error": "Not enough memes"}, status=400)
#
#     selected_human = random.choice(list(human_qs))
#     selected_ai = random.choice(list(ai_qs))
#
#     return Response(MemeSerializer([selected_human, selected_ai], many=True).data)
#
# @api_view(["POST"])
# def vote_meme(request):
#     meme_id = request.data.get("meme_id")
#     if not meme_id:
#         return Response({"error": "meme_id required"}, status=400)
#
#     try:
#         meme = Meme.objects.get(id=meme_id)
#     except Meme.DoesNotExist:
#         return Response({"error": "not found"}, status=404)
#
#     meme.total_votes += 1
#     meme.save()
#     return Response({"success": True, "total_votes": meme.total_votes})
#
#
# @api_view(["POST"])
# def report_meme(request):
#     print("Meme reported:", request.data.get("meme_id"))
#     return Response({"success": True})
#
#
# @api_view(["GET"])
# def leaderboard(request):
#     memes = Meme.objects.all().order_by("-total_votes")[:10]
#     return Response(MemeSerializer(memes, many=True).data)



# memes/views.py

# import os
# import random
#
# from django.conf import settings
# from django.shortcuts import get_object_or_404
#
# from rest_framework import viewsets, status
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.permissions import IsAdminUser, AllowAny
# from rest_framework.response import Response
# from rest_framework.views import APIView
#
# import cloudinary
# import cloudinary.api
# import cloudinary.uploader
#
# from openai import OpenAI
#
# from .models import Category, MemeTemplate, Meme, WeeklyTopic
# from .serializers import CategorySerializer, MemeTemplateSerializer, MemeSerializer
# from .services import generate_ai_meme_design, apply_ai_text_to_image
# from .utils import get_current_topic_or_400
#
# client = OpenAI(api_key=settings.OPENAI_API_KEY)
#
# # Cloudinary 설정
# cloudinary.config(
#     cloud_name=os.getenv("CLOUDINARY_NAME"),
#     api_key=os.getenv("CLOUDINARY_API_KEY"),
#     api_secret=os.getenv("CLOUDINARY_API_SECRET"),
# )
#
#
# # =========================
# # Category / Template / Meme CRUD
# # =========================
#
# class CategoryViewSet(viewsets.ModelViewSet):
#     queryset = Category.objects.all()
#     serializer_class = CategorySerializer
#
#
# class MemeTemplateViewSet(viewsets.ModelViewSet):
#     queryset = MemeTemplate.objects.all()
#     serializer_class = MemeTemplateSerializer
#
#
# class MemeViewSet(viewsets.ModelViewSet):
#     queryset = Meme.objects.all().order_by("-created_at")
#     serializer_class = MemeSerializer
#
#
# # =========================
# # 현재 토픽 조회 (프론트용)
# # =========================
#
# @api_view(["GET"])
# @permission_classes([AllowAny])
# def current_topic_view(request):
#     topic_obj = WeeklyTopic.get_current_topic()
#     if not topic_obj:
#         return Response({"topic": None}, status=status.HTTP_200_OK)
#
#     return Response(
#         {
#             "name": topic_obj.name,
#             "start_date": topic_obj.start_date,
#             "end_date": topic_obj.end_date,
#         },
#         status=status.HTTP_200_OK,
#     )
#
#
# # =========================
# # AI 밈 생성 (단일 템플릿)
# # =========================
#
# @api_view(["POST"])
# def generate_ai_meme(request):
#     template_id = request.data.get("template")
#     if not template_id:
#         return Response(
#             {"error": "template id required"},
#             status=status.HTTP_400_BAD_REQUEST,
#         )
#
#     template = get_object_or_404(MemeTemplate, id=template_id)
#
#     # 이번 주 토픽
#     try:
#         current_topic = get_current_topic_or_400()
#     except Exception as e:
#         return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#
#     category_name = template.category.name if template.category else ""
#     template_desc = template.description or ""
#
#     try:
#         template_image_url = template.image.url
#     except Exception:
#         # image 필드가 그냥 URL 문자열일 수도 있어서 fallback
#         template_image_url = str(template.image)
#         if not template_image_url:
#             return Response(
#                 {"error": "Template image URL missing"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )
#
#     # 1) AI caption + style config
#     design = generate_ai_meme_design(
#         topic=current_topic,
#         category_name=category_name,
#         template_desc=template_desc,
#         template_url=template_image_url,
#     )
#
#     if "error" in design:
#         return Response(design, status=status.HTTP_502_BAD_GATEWAY)
#
#     captions = design.get("captions") or []
#     if not captions:
#         return Response(
#             {"error": "No captions generated from AI"},
#             status=status.HTTP_502_BAD_GATEWAY,
#         )
#
#     # 2) 이미지 위에 텍스트 입히기 + Cloudinary 업로드
#     try:
#         public_id = apply_ai_text_to_image(template_image_url, captions)
#     except Exception as e:
#         print("apply_ai_text_to_image error:", repr(e))
#         return Response(
#             {"error": "image_generation_failed", "detail": str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         )
#
#     # 3) DB에 Meme 저장
#     try:
#         meme = Meme.objects.create(
#             template=template,
#             image=public_id,  # CloudinaryField → public_id
#             caption="; ".join([str(c.get("text", "")) for c in captions]),
#             created_by="ai",
#             format="macro",
#             topic=current_topic,  # 이번 주 토픽 고정
#         )
#     except Exception as e:
#         print("Meme create error:", repr(e))
#         return Response(
#             {"error": "db_create_failed", "detail": str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         )
#
#     serializer = MemeSerializer(meme)
#     return Response(serializer.data, status=status.HTTP_201_CREATED)
#
#
# # =========================
# # AI 밈 생성 (여러 템플릿에서 N개)
# # =========================
#
# @api_view(["POST"])
# def generate_multiple_ai_memes(request):
#     """
#     POST /api/memes/ai-generate/multiple/
#     body 예시:
#     {
#       "count": 5,
#       "template_ids": [1, 2, 3]   // 선택사항, 없으면 전체 템플릿에서 랜덤
#     }
#     """
#     try:
#         current_topic = get_current_topic_or_400()
#     except Exception as e:
#         return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#
#     count = int(request.data.get("count", 3))
#     if count < 1:
#         count = 1
#     if count > 20:
#         count = 20  # 안전하게 상한선
#
#     template_ids = request.data.get("template_ids") or []
#     if template_ids:
#         templates_qs = MemeTemplate.objects.filter(id__in=template_ids)
#     else:
#         templates_qs = MemeTemplate.objects.all()
#
#     templates = list(templates_qs)
#     if not templates:
#         return Response(
#             {"error": "No templates available"},
#             status=status.HTTP_400_BAD_REQUEST,
#         )
#
#     created_memes = []
#
#     for _ in range(count):
#         template = random.choice(templates)
#
#         category_name = template.category.name if template.category else ""
#         template_desc = template.description or ""
#
#         try:
#             template_image_url = template.image.url
#         except Exception:
#             template_image_url = str(template.image)
#             if not template_image_url:
#                 # 이 템플릿은 스킵
#                 continue
#
#         design = generate_ai_meme_design(
#             topic=current_topic,
#             category_name=category_name,
#             template_desc=template_desc,
#             template_url=template_image_url,
#         )
#
#         if "error" in design:
#             print("AI design error for template", template.id, design)
#             continue
#
#         captions = design.get("captions") or []
#         if not captions:
#             continue
#
#         try:
#             public_id = apply_ai_text_to_image(template_image_url, captions)
#         except Exception as e:
#             print("apply_ai_text_to_image error:", repr(e))
#             continue
#
#         meme = Meme.objects.create(
#             template=template,
#             image=public_id,
#             caption="; ".join([str(c.get("text", "")) for c in captions]),
#             created_by="ai",
#             format="macro",
#             topic=current_topic,
#         )
#         created_memes.append(meme)
#
#     if not created_memes:
#         return Response(
#             {"error": "AI memes could not be generated"},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         )
#
#     data = MemeSerializer(created_memes, many=True).data
#     return Response(data, status=status.HTTP_201_CREATED)
#
#
# # =========================
# # Cloudinary 데이터 import
# # =========================
#
# @api_view(["POST"])
# @permission_classes([AllowAny])
# def import_cloudinary_data(request):
#     folder = request.data.get("folder") or ""
#     type_ = request.data.get("type", "template")
#     topic = request.data.get("topic", "")
#     category_name = request.data.get("category", "General")
#
#     if not folder:
#         return Response({"error": "folder required"}, status=400)
#
#     category, _ = Category.objects.get_or_create(name=category_name)
#
#     imported = 0
#     skipped = 0
#     next_cursor = None
#
#     while True:
#         try:
#             resp = cloudinary.api.resources(
#                 type="upload",
#                 prefix=folder,
#                 max_results=100,
#                 next_cursor=next_cursor,
#             )
#         except Exception as e:
#             return Response({"error": str(e)}, status=500)
#
#         resources = resp.get("resources", [])
#         if not resources and not resp.get("next_cursor"):
#             break
#
#         for res in resources:
#             url = res.get("secure_url")
#             if not url:
#                 continue
#
#             # Template import
#             if type_ == "template":
#                 if MemeTemplate.objects.filter(image=url).exists():
#                     skipped += 1
#                     continue
#
#                 MemeTemplate.objects.create(
#                     category=category,
#                     image=url,
#                     description="Imported from Cloudinary",
#                 )
#                 imported += 1
#
#             # Meme import
#             elif type_ == "meme":
#                 if Meme.objects.filter(image=url).exists():
#                     skipped += 1
#                     continue
#
#                 lower = url.lower()
#
#                 creator = "ai" if "/memes/ai/" in lower else "human"
#                 caption = "AI generated meme" if creator == "ai" else "User meme"
#
#                 Meme.objects.create(
#                     template=None,
#                     image=url,
#                     caption=caption,
#                     created_by=creator,
#                     format="macro",
#                     topic=topic,
#                 )
#                 imported += 1
#
#         next_cursor = resp.get("next_cursor")
#         if not next_cursor:
#             break
#
#     return Response(
#         {
#             "imported": imported,
#             "skipped_duplicates": skipped,
#             "folder": folder,
#             "type": type_,
#         },
#         status=201,
#     )
#
#
# # =========================
# # 유저 밈 업로드 (Human)
# # =========================
#
# class UserMemeUploadView(APIView):
#     parser_classes = [MultiPartParser, FormParser]
#
#     def post(self, request):
#         file_obj = request.FILES.get("image_file")
#         if not file_obj:
#             return Response({"error": "image_file required"}, status=400)
#
#         caption = request.data.get("caption", "")
#         template_id = request.data.get("template_id")
#
#         template = None
#         if template_id:
#             try:
#                 if template_id.isdigit():
#                     template = MemeTemplate.objects.get(id=int(template_id))
#                 else:
#                     template = MemeTemplate.objects.filter(
#                         image__icontains=template_id
#                     ).first()
#             except MemeTemplate.DoesNotExist:
#                 return Response({"error": "template not found"}, status=404)
#         else:
#             template = MemeTemplate.objects.first()
#
#         # 토픽: 현재 WeeklyTopic이 있으면 그걸 쓰고, 없으면 템플릿 카테고리 이름으로 fallback
#         try:
#             current_topic = get_current_topic_or_400()
#         except Exception:
#             current_topic = (
#                 template.category.name
#                 if template and template.category
#                 else ""
#             )
#
#         # Cloudinary upload
#         upload_result = cloudinary.uploader.upload(
#             file_obj,
#             folder="memes/human/",
#             resource_type="image",
#         )
#
#         format_value = request.data.get("format") or (
#             template.description if template else "macro"
#         )
#
#         meme = Meme.objects.create(
#             template=template,
#             image=upload_result["secure_url"],
#             caption=caption,
#             created_by="human",
#             format=format_value,
#             topic=current_topic,
#         )
#
#         return Response(MemeSerializer(meme).data, status=201)
#
#
# # =========================
# # 랜덤 human vs ai (같은 토픽에서만)
# # =========================
#
# @api_view(["GET"])
# def random_memes(request):
#     try:
#         current_topic = get_current_topic_or_400()
#     except Exception as e:
#         return Response({"error": str(e)}, status=400)
#
#     human_qs = Meme.objects.filter(
#         created_by="human",
#         topic=current_topic,
#     ).exclude(image="")
#
#     ai_qs = Meme.objects.filter(
#         created_by="ai",
#         topic=current_topic,
#     ).exclude(image="")
#
#     if not human_qs.exists() or not ai_qs.exists():
#         return Response({"error": "Not enough memes"}, status=400)
#
#     selected_human = random.choice(list(human_qs))
#     selected_ai = random.choice(list(ai_qs))
#
#     return Response(MemeSerializer([selected_human, selected_ai], many=True).data)
#
#
# # =========================
# # 투표 / 신고 / 리더보드
# # =========================
#
# @api_view(["POST"])
# def vote_meme(request):
#     meme_id = request.data.get("meme_id")
#     if not meme_id:
#         return Response({"error": "meme_id required"}, status=400)
#
#     try:
#         meme = Meme.objects.get(id=meme_id)
#     except Meme.DoesNotExist:
#         return Response({"error": "not found"}, status=404)
#
#     meme.total_votes += 1
#     meme.save()
#     return Response({"success": True, "total_votes": meme.total_votes})
#
#
# @api_view(["POST"])
# def report_meme(request):
#     print("Meme reported:", request.data.get("meme_id"))
#     return Response({"success": True})
#
#
# @api_view(["GET"])
# def leaderboard(request):
#     memes = Meme.objects.all().order_by("-total_votes")[:10]
#     return Response(MemeSerializer(memes, many=True).data)



import os
import random

from django.conf import settings
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

import cloudinary
import cloudinary.api
import cloudinary.uploader

from openai import OpenAI

from .models import Category, MemeTemplate, Meme, WeeklyTopic
from .serializers import CategorySerializer, MemeTemplateSerializer, MemeSerializer
from .services import (
    generate_ai_meme_design,
    apply_ai_text_to_image,
    ensure_ai_balance_for_topic,
)
from .utils import get_current_topic_or_400

client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Cloudinary config
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)


# Category / Template / Meme CRUD

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class MemeTemplateViewSet(viewsets.ModelViewSet):
    queryset = MemeTemplate.objects.all()
    serializer_class = MemeTemplateSerializer


class MemeViewSet(viewsets.ModelViewSet):
    queryset = Meme.objects.all().order_by("-created_at")
    serializer_class = MemeSerializer




@api_view(["GET"])
@permission_classes([AllowAny])
def current_topic_view(request):
    topic_obj = WeeklyTopic.get_current_topic()
    if not topic_obj:
        return Response({"topic": None}, status=status.HTTP_200_OK)

    return Response(
        {
            "name": topic_obj.name,
            "start_date": topic_obj.start_date,
            "end_date": topic_obj.end_date,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def generate_ai_meme(request):
    template_id = request.data.get("template")
    if not template_id:
        return Response(
            {"error": "template id required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    template = get_object_or_404(MemeTemplate, id=template_id)

    try:
        current_topic = get_current_topic_or_400()
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    category_name = template.category.name if template.category else ""
    template_desc = template.description or ""

    try:
        template_image_url = template.image.url
    except Exception:
        template_image_url = str(template.image)
        if not template_image_url:
            return Response(
                {"error": "Template image URL missing"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # meme cnt (default 5, max 7)
    try:
        requested_count = int(request.data.get("count", 5))
    except Exception:
        requested_count = 5

    if requested_count < 1:
        requested_count = 1
    if requested_count > 7:
        requested_count = 7

    # 1) AI caption + style config
    design = generate_ai_meme_design(
        topic=current_topic,
        category_name=category_name,
        template_desc=template_desc,
        template_url=template_image_url,
    )

    if "error" in design:
        return Response(design, status=status.HTTP_502_BAD_GATEWAY)

    captions = design.get("captions") or []
    if not captions:
        return Response(
            {"error": "No captions generated from AI"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    captions = captions[:requested_count]

    created_memes = []

    for cap in captions:
        try:
            public_id = apply_ai_text_to_image(template_image_url, [cap])
        except Exception as e:
            print("apply_ai_text_to_image error:", repr(e))
            continue

        try:
            meme = Meme.objects.create(
                template=template,
                image=public_id,  # CloudinaryField → public_id
                caption=str(cap.get("text", "")),
                created_by="ai",
                format="macro",
                topic=current_topic,
            )
            created_memes.append(meme)
        except Exception as e:
            print("Meme create error:", repr(e))
            continue

    if not created_memes:
        return Response(
            {"error": "AI memes could not be generated"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    serializer = MemeSerializer(created_memes, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# AI meme generate

@api_view(["POST"])
def generate_multiple_ai_memes(request):
    """
    여러 템플릿을 사용해서 한 번에 여러 개 AI 밈 생성.
    - 네 원래 로직(랜덤 템플릿 + 여러 캡션 → 여러 밈 생성)은 유지.
    - 대신 한 요청당:
      - count 상한 5
      - OpenAI 호출 최대 3번
    으로 제한해서 타임아웃 위험을 줄임.
    """
    try:
        current_topic = get_current_topic_or_400()
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # 기존: max 20 → 🔴 max 5 로 줄임
    try:
        count = int(request.data.get("count", 3))
    except Exception:
        count = 3

    if count < 1:
        count = 1
    if count > 5:  # 🔴 20 → 5
        count = 5

    template_ids = request.data.get("template_ids") or []
    if template_ids:
        templates_qs = MemeTemplate.objects.filter(id__in=template_ids)
    else:
        templates_qs = MemeTemplate.objects.all()

    templates = list(templates_qs)
    if not templates:
        return Response(
            {"error": "No templates available"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    created_memes = []

    # 🔴 한 요청당 OpenAI 호출 제한 추가
    max_openai_calls = 3
    openai_calls = 0

    # 템플릿 선택 시도 횟수 (너무 크게 안 잡음)
    max_iterations = count * 2

    for _ in range(max_iterations):
        if len(created_memes) >= count:
            break
        if openai_calls >= max_openai_calls:
            break

        template = random.choice(templates)

        category_name = template.category.name if template.category else ""
        template_desc = template.description or ""

        try:
            template_image_url = template.image.url
        except Exception:
            template_image_url = str(template.image)
            if not template_image_url:
                continue

        # 🔴 여기서 OpenAI 한 번 호출
        print("generate_multiple_ai_memes: calling generate_ai_meme_design for template", template.id)
        design = generate_ai_meme_design(
            topic=current_topic,
            category_name=category_name,
            template_desc=template_desc,
            template_url=template_image_url,
        )
        openai_calls += 1

        if "error" in design:
            print("AI design error for template", template.id, design)
            continue

        captions = design.get("captions") or []
        if not captions:
            continue

        for cap in captions:
            if len(created_memes) >= count:
                break

            try:
                public_id = apply_ai_text_to_image(template_image_url, [cap])
            except Exception as e:
                print("apply_ai_text_to_image error:", repr(e))
                continue

            try:
                meme = Meme.objects.create(
                    template=template,
                    image=public_id,
                    caption=str(cap.get("text", "")),
                    created_by="ai",
                    format="macro",
                    topic=current_topic,
                )
            except Exception as e:
                print("Meme create error:", repr(e))
                continue

            created_memes.append(meme)

    if not created_memes:
        return Response(
            {"error": "AI memes could not be generated"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    data = MemeSerializer(created_memes, many=True).data
    return Response(data, status=status.HTTP_201_CREATED)


# Cloudinary data import

@api_view(["POST"])
@permission_classes([AllowAny])
def import_cloudinary_data(request):
    folder = request.data.get("folder") or ""
    type_ = request.data.get("type", "template")
    topic = request.data.get("topic", "")
    category_name = request.data.get("category", "General")

    if not folder:
        return Response({"error": "folder required"}, status=400)

    category, _ = Category.objects.get_or_create(name=category_name)

    imported = 0
    skipped = 0
    next_cursor = None

    while True:
        try:
            resp = cloudinary.api.resources(
                type="upload",
                prefix=folder,
                max_results=100,
                next_cursor=next_cursor,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        resources = resp.get("resources", [])
        if not resources and not resp.get("next_cursor"):
            break

        for res in resources:
            url = res.get("secure_url")
            if not url:
                continue

            # Template import
            if type_ == "template":
                if MemeTemplate.objects.filter(image=url).exists():
                    skipped += 1
                    continue

                MemeTemplate.objects.create(
                    category=category,
                    image=url,
                    description="Imported from Cloudinary",
                )
                imported += 1

            # Meme import
            elif type_ == "meme":
                if Meme.objects.filter(image=url).exists():
                    skipped += 1
                    continue

                lower = url.lower()

                creator = "ai" if "/memes/ai/" in lower else "human"
                caption = "AI generated meme" if creator == "ai" else "User meme"

                Meme.objects.create(
                    template=None,
                    image=url,
                    caption=caption,
                    created_by=creator,
                    format="macro",
                    topic=topic,
                )
                imported += 1

        next_cursor = resp.get("next_cursor")
        if not next_cursor:
            break

    return Response(
        {
            "imported": imported,
            "skipped_duplicates": skipped,
            "folder": folder,
            "type": type_,
        },
        status=201,
    )


# user mem upload

class UserMemeUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get("image_file")
        if not file_obj:
            return Response({"error": "image_file required"}, status=400)

        caption = request.data.get("caption", "")
        template_id = request.data.get("template_id")

        template = None
        if template_id:
            try:
                if template_id.isdigit():
                    template = MemeTemplate.objects.get(id=int(template_id))
                else:
                    template = MemeTemplate.objects.filter(
                        image__icontains=template_id
                    ).first()
            except MemeTemplate.DoesNotExist:
                return Response({"error": "template not found"}, status=404)
        else:
            template = MemeTemplate.objects.first()

        try:
            current_topic = get_current_topic_or_400()
        except Exception:
            current_topic = (
                template.category.name
                if template and template.category
                else ""
            )

        # Cloudinary upload
        upload_result = cloudinary.uploader.upload(
            file_obj,
            folder="memes/human/",
            resource_type="image",
        )

        format_value = request.data.get("format") or (
            template.description if template else "macro"
        )

        meme = Meme.objects.create(
            template=template,
            image=upload_result["secure_url"],
            caption=caption,
            created_by="human",
            format=format_value,
            topic=current_topic,
        )

        try:
            ensure_ai_balance_for_topic(
                topic=current_topic,
                base_template=template,
                min_ratio=0.7,
                max_diff=3,
                max_new=3,
            )
        except Exception as e:
            print("AI balance error:", repr(e))

        return Response(MemeSerializer(meme).data, status=201)


# human vs ai randomly

@api_view(["GET"])
def random_memes(request):
    try:
        current_topic = get_current_topic_or_400()
    except Exception as e:
        return Response({"error": str(e)}, status=400)

    human_qs = Meme.objects.filter(
        created_by="human",
        topic=current_topic,
    ).exclude(image="")

    ai_qs = Meme.objects.filter(
        created_by="ai",
        topic=current_topic,
    ).exclude(image="")

    if not human_qs.exists() or not ai_qs.exists():
        return Response({"error": "Not enough memes"}, status=400)

    selected_human = random.choice(list(human_qs))
    selected_ai = random.choice(list(ai_qs))

    return Response(MemeSerializer([selected_human, selected_ai], many=True).data)



@api_view(["POST"])
def vote_meme(request):
    meme_id = request.data.get("meme_id")
    if not meme_id:
        return Response({"error": "meme_id required"}, status=400)

    try:
        meme = Meme.objects.get(id=meme_id)
    except Meme.DoesNotExist:
        return Response({"error": "not found"}, status=404)

    meme.total_votes += 1
    meme.save()
    return Response({"success": True, "total_votes": meme.total_votes})


@api_view(["POST"])
def report_meme(request):
    print("Meme reported:", request.data.get("meme_id"))
    return Response({"success": True})


@api_view(["GET"])
def leaderboard(request):
    memes = Meme.objects.all().order_by("-total_votes")[:10]
    return Response(MemeSerializer(memes, many=True).data)
