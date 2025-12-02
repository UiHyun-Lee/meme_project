# from rest_framework import viewsets, status
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.permissions import IsAdminUser, AllowAny
# from rest_framework.response import Response
# from rest_framework.views import APIView
#
# from evaluations.models import Evaluation
# from .models import Category, MemeTemplate, Meme
# from .serializers import CategorySerializer, MemeTemplateSerializer, MemeSerializer
# from .services import generate_ai_meme_design, apply_ai_text_to_image
#
# import cloudinary
# import cloudinary.api
# import os
#
#
# # Cloudinary 설정
# cloudinary.config(
#     cloud_name=os.getenv("CLOUDINARY_NAME"),
#     api_key=os.getenv("CLOUDINARY_API_KEY"),
#     api_secret=os.getenv("CLOUDINARY_API_SECRET"),
# )
#
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
# @api_view(["POST"])
# def generate_ai_meme(request):
#     """
#     Cloudinary의 실제 이미지를 기반으로,
#     AI가 텍스트+스타일 JSON 생성 → Pillow로 합성 → Cloudinary 업로드 → DB 저장
#     """
#     template_id = request.data.get("template")
#     if not template_id:
#         return Response({"error": "template id required"}, status=400)
#
#     try:
#         template = MemeTemplate.objects.get(id=template_id)
#     except MemeTemplate.DoesNotExist:
#         return Response({"error": "Template not found"}, status=404)
#
#     design = generate_ai_meme_design(
#         category_name=template.category.name,
#         template_desc=template.description or "",
#         template_url=template.image.url,
#     )
#
#     if "error" in design:
#         return Response(design, status=500)
#
#     memes_data = design.get("memes", [])
#     created_memes = []
#
#     for meme_design in memes_data:
#         captions = meme_design.get("captions", [])
#         # Pillow로 합성된 최종 이미지 (로컬 경로 또는 파일 객체라고 가정)
#         final_image = apply_ai_text_to_image(template.image.url, captions)
#
#         # Cloudinary 업로드
#         upload_result = cloudinary.uploader.upload(
#             final_image,
#             folder="memes/ai/",
#             resource_type="image",
#         )
#
#         meme = Meme.objects.create(
#             template=template,
#             image=upload_result["secure_url"],
#             caption="; ".join([c["text"] for c in captions]),
#             created_by="ai",
#             format="macro",
#             topic=template.category.name,
#         )
#         created_memes.append(MemeSerializer(meme).data)
#
#     return Response(created_memes, status=status.HTTP_201_CREATED)
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
#
#     next_cursor = None
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
#             url = res.get("secure_url") or res.get("url")
#             if not url:
#                 continue
#
#             if type_ == "template":
#                 if MemeTemplate.objects.filter(image=url).exists():
#                     skipped += 1
#                     continue
#                 MemeTemplate.objects.create(
#                     category=category,
#                     image=url,
#                     description="Imported from Cloudinary",
#                 )
#                 imported += 1
#
#             elif type_ == "meme":
#                 if Meme.objects.filter(image=url).exists():
#                     skipped += 1
#                     continue
#
#                 lower = (url or "").lower()
#
#                 if "/memes/ai/" in lower:
#                     creator = "ai"
#                     default_caption = "AI generated meme"
#                 elif "/memes/human/" in lower:
#                     creator = "human"
#                     default_caption = "User meme"
#                 else:
#                     creator = "human"
#                     default_caption = "User meme"
#
#                 Meme.objects.create(
#                     template=None,
#                     image=url,
#                     caption=default_caption,
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
#             "imported_count": imported,
#             "skipped_duplicates": skipped,
#             "folder": folder,
#             "type": type_,
#         },
#         status=status.HTTP_201_CREATED,
#     )
#
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
#                 # id 또는 public_id 모두 허용
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
#         serializer = MemeSerializer(meme)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#
#
# @api_view(["GET", "POST"])
# @permission_classes([AllowAny])
# def list_or_import_cloudinary_templates(request):
#     """
#     GET  → Cloudinary 'templates/' 폴더 내 이미지 목록 조회 (미리보기용)
#     POST → Cloudinary에서 'templates/' 이미지들을 MemeTemplate DB에 등록
#     """
#     if request.method == "GET":
#         try:
#             result = cloudinary.api.resources(
#                 type="upload",
#                 prefix="templates/",
#                 max_results=100,
#             )
#             images = [
#                 {
#                     "url": item["secure_url"],
#                     "public_id": item["public_id"],
#                 }
#                 for item in result.get("resources", [])
#             ]
#             return Response({"templates": images}, status=200)
#         except Exception as e:
#             return Response({"error": str(e)}, status=500)
#
#     # POST → DB import
#     category_name = request.data.get("category", "General")
#     category, _ = Category.objects.get_or_create(name=category_name)
#     imported, skipped = 0, 0
#     next_cursor = None
#
#     while True:
#         try:
#             resp = cloudinary.api.resources(
#                 type="upload",
#                 prefix="templates/",
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
#             if MemeTemplate.objects.filter(image=url).exists():
#                 skipped += 1
#                 continue
#
#             MemeTemplate.objects.create(
#                 category=category,
#                 image=url,
#                 description="Imported from Cloudinary",
#             )
#             imported += 1
#
#         next_cursor = resp.get("next_cursor")
#         if not next_cursor:
#             break
#
#     return Response(
#         {
#             "imported_count": imported,
#             "skipped_duplicates": skipped,
#             "category": category_name,
#         },
#         status=status.HTTP_201_CREATED,
#     )
#
#
# @api_view(["GET"])
# def random_memes(request):
#     human_qs = (
#         Meme.objects.filter(created_by__iexact="human")
#         .exclude(image__isnull=True)
#         .exclude(image="")
#     )
#     ai_qs = (
#         Meme.objects.filter(created_by__iexact="ai")
#         .exclude(image__isnull=True)
#         .exclude(image="")
#     )
#
#     human_memes = list(human_qs)
#     ai_memes = list(ai_qs)
#
#     print(f"HUMAN MEMES: {len(human_memes)}")
#     print(f"AI MEMES: {len(ai_memes)}")
#
#     if not human_memes or not ai_memes:
#         return Response({"error": "Not enough memes"}, status=400)
#
#     import random
#
#     selected_human = random.choice(human_memes)
#     selected_ai = random.choice(ai_memes)
#
#     serializer = MemeSerializer([selected_human, selected_ai], many=True)
#     return Response(serializer.data)
#
#
# @api_view(["POST"])
# def vote_meme(request):
#     meme_id = request.data.get("meme_id")
#
#     if not meme_id:
#         return Response({"error": "meme_id required"}, status=400)
#
#     try:
#         meme = Meme.objects.get(id=meme_id)
#     except Meme.DoesNotExist:
#         return Response({"error": "Meme not found"}, status=404)
#
#     meme.total_votes = meme.total_votes + 1
#     meme.save(update_fields=["total_votes"])
#     return Response({"success": True, "total_votes": meme.total_votes})
#
#
# @api_view(["POST"])
# def report_meme(request):
#     meme_id = request.data.get("meme_id")
#     print(f"meme {meme_id} reported!")
#     return Response({"success": True})
#
#
# @api_view(["GET"])
# @permission_classes([AllowAny])
# def leaderboard(request):
#     """
#     Returns top memes sorted by total_votes!
#     """
#     memes = Meme.objects.all().order_by("-total_votes")[:10]
#     serializer = MemeSerializer(memes, many=True)
#     return Response(serializer.data)



from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from evaluations.models import Evaluation
from .models import Category, MemeTemplate, Meme
from .serializers import CategorySerializer, MemeTemplateSerializer, MemeSerializer
from .services import generate_ai_meme_design, apply_ai_text_to_image

import cloudinary
import cloudinary.api
import cloudinary.uploader
import os


# Cloudinary 설정
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)


# =========================
# Category / Template / Meme CRUD
# =========================

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class MemeTemplateViewSet(viewsets.ModelViewSet):
    queryset = MemeTemplate.objects.all()
    serializer_class = MemeTemplateSerializer


class MemeViewSet(viewsets.ModelViewSet):
    queryset = Meme.objects.all().order_by("-created_at")
    serializer_class = MemeSerializer


# =========================
# AI Meme Generation
# =========================

# @api_view(["POST"])
# def generate_ai_meme(request):
#     """
#     Cloudinary 템플릿 이미지를 기반으로:
#     1) AI가 캡션 JSON 생성
#     2) Pillow로 텍스트 합성
#     3) Cloudinary에 memes/ai/ 폴더로 업로드
#     4) DB 저장 후 프론트에 반환
#     """
#     template_id = request.data.get("template")
#     if not template_id:
#         return Response({"error": "template id required"}, status=400)
#
#     try:
#         template = MemeTemplate.objects.get(id=template_id)
#     except MemeTemplate.DoesNotExist:
#         return Response({"error": "Template not found"}, status=404)
#
#     # AI 요청
#     design = generate_ai_meme_design(
#         category_name=template.category.name,
#         template_desc=template.description or "",
#         template_url=template.image.url,
#     )
#
#     if "error" in design:
#         return Response(design, status=500)
#
#     memes_data = design.get("memes", [])
#     created_memes = []
#
#     for meme_design in memes_data:
#         captions = meme_design.get("captions", [])
#
#         # 이미지 합성
#         final_image = apply_ai_text_to_image(template.image.url, captions)
#
#         # Cloudinary 업로드
#         upload_result = cloudinary.uploader.upload(
#             final_image,
#             folder="memes/ai/",
#             resource_type="image",
#         )
#
#         meme = Meme.objects.create(
#             template=template,
#             image=upload_result["secure_url"],
#             caption="; ".join([c["text"] for c in captions]),
#             created_by="ai",
#             format="macro",
#             topic=template.category.name,
#         )
#         created_memes.append(MemeSerializer(meme).data)
#
#     return Response(created_memes, status=status.HTTP_201_CREATED)

@api_view(["POST"])
def generate_ai_meme(request):
    # 1) 요청 제대로 들어오는지 확인
    template_id = request.data.get("template")
    print("=== generate_ai_meme called, template_id:", template_id)

    # 2) OpenAI 연결 테스트 (프롬프트는 초간단)
    try:
        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": "Return a JSON object: {\"ok\": true, \"msg\": \"hello from openai\"}"
                }
            ],
            max_tokens=50,
            response_format={"type": "json_object"},
        )
    except Exception as e:
        # 🔥 여기서 OpenAI 키/네트워크 문제면 전부 잡힘
        print("=== OpenAI error ===", repr(e))
        return Response(
            {"error": "openai_error", "detail": str(e)},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    msg = res.choices[0].message

    # 3) json_object 모드면 여기서 이미 dict 로 받을 수 있는 경우가 있음
    if hasattr(msg, "parsed") and msg.parsed is not None:
        data = msg.parsed
    else:
        # parsed 없으면 content를 그대로 돌려보자 (일단 파싱 안 함)
        data = {"raw": msg.content}

    print("=== OpenAI success ===", data)

    return Response(
        {"from_openai": data},
        status=status.HTTP_200_OK,

# =========================
# Cloudinary Import (Templates / Memes)
# =========================

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


# =========================
# User Meme Upload
# =========================

class UserMemeUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get("image_file")
        if not file_obj:
            return Response({"error": "image_file required"}, status=400)

        caption = request.data.get("caption", "")
        topic = request.data.get("topic", "")
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

        if not topic and template:
            topic = template.category.name

        # Cloudinary 업로드 (사용자 업로드)
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
            topic=topic,
        )

        return Response(MemeSerializer(meme).data, status=201)


# =========================
# Random Meme API (Voting)
# =========================

@api_view(["GET"])
def random_memes(request):
    human_qs = Meme.objects.filter(created_by="human").exclude(image="")
    ai_qs = Meme.objects.filter(created_by="ai").exclude(image="")

    import random
    if not human_qs.exists() or not ai_qs.exists():
        return Response({"error": "Not enough memes"}, status=400)

    selected_human = random.choice(list(human_qs))
    selected_ai = random.choice(list(ai_qs))

    return Response(MemeSerializer([selected_human, selected_ai], many=True).data)


# =========================
# Voting / Reporting / Leaderboard
# =========================

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
