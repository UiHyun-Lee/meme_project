<<<<<<< HEAD
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
import cloudinary.api
import os
import cloudinary
=======
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Category, MemeTemplate, Meme
from .serializers import CategorySerializer, MemeTemplateSerializer, MemeSerializer
from .services import generate_ai_meme_design, apply_ai_text_to_image
>>>>>>> origin/main


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class MemeTemplateViewSet(viewsets.ModelViewSet):
    queryset = MemeTemplate.objects.all()
    serializer_class = MemeTemplateSerializer


class MemeViewSet(viewsets.ModelViewSet):
    queryset = Meme.objects.all().order_by("-created_at")
    serializer_class = MemeSerializer


@api_view(["POST"])
def generate_ai_meme(request):
<<<<<<< HEAD
=======
    """
    Cloudinary의 실제 이미지를 기반으로,
    AI가 텍스트+스타일 JSON 생성 → Pillow로 합성 → Cloudinary 업로드 → DB 저장
    """
>>>>>>> origin/main
    template_id = request.data.get("template")
    if not template_id:
        return Response({"error": "template id required"}, status=400)

    try:
        template = MemeTemplate.objects.get(id=template_id)
    except MemeTemplate.DoesNotExist:
        return Response({"error": "Template not found"}, status=404)

<<<<<<< HEAD
=======
    # 1️⃣ LLM 호출 → JSON 생성
>>>>>>> origin/main
    design = generate_ai_meme_design(
        category_name=template.category.name,
        template_desc=template.description or "",
        template_url=template.image.url
    )

    if "error" in design:
        return Response(design, status=500)

    memes_data = design.get("memes", [])
    created_memes = []

<<<<<<< HEAD
=======
    # 2️⃣ 각 밈 디자인 합성 + Cloudinary 업로드
>>>>>>> origin/main
    for meme_design in memes_data:
        captions = meme_design.get("captions", [])
        final_url = apply_ai_text_to_image(template.image.url, captions)

<<<<<<< HEAD
        upload_result = cloudinary.uploader.upload(
            final_url,
            folder="memes/ai/",
            resource_type="image"
        )

        meme = Meme.objects.create(
            template=template,
            image=upload_result["secure_url"],
=======
        meme = Meme.objects.create(
            template=template,
            image=final_url,
>>>>>>> origin/main
            caption="; ".join([c["text"] for c in captions]),
            created_by="ai",
            format="macro",
            topic=template.category.name
        )
<<<<<<< HEAD

        created_memes.append(MemeSerializer(meme).data)

    return Response(created_memes)


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


@api_view(["POST"])
@permission_classes([AllowAny])
def import_cloudinary_data(request):

    folder = request.data.get("folder") or ""
    type_ = request.data.get("type", "template")
    topic = request.data.get("topic", "")
    category_name = request.data.get("category", "General")

    if folder is None:
        return Response({"error": "folder required"}, status=400)

    category, _ = Category.objects.get_or_create(name=category_name)

    imported = 0
    skipped = 0
    errors = []

    # ---- 페이지네이션: next_cursor 계속 따라가기 ----
    next_cursor = None
    while True:
        try:
            resp = cloudinary.api.resources(
                type="upload",
                prefix=folder,         # 해당 폴더/프리픽스 아래만
                max_results=100,       # Cloudinary 최대치 (계정에 따라 상한 500)
                next_cursor=next_cursor
            )
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        resources = resp.get("resources", [])
        if not resources and not next_cursor:
            break

        for res in resources:
            url = res.get("secure_url") or res.get("url")
            if not url:
                continue

            # 중복은 건너뜀
            if type_ == "template":
                if MemeTemplate.objects.filter(image=url).exists():
                    skipped += 1
                    continue
                MemeTemplate.objects.create(
                    category=category,
                    image=url,
                    description="Imported from Cloudinary"
                )
                imported += 1

            elif type_ == "meme":
                if Meme.objects.filter(image=url).exists():
                    skipped += 1
                    continue

                lower = (url or "").lower()
                # 폴더명으로 creator 추론 (기본 human)
                if "/memes/ai/" in lower:
                    creator = "ai"
                    default_caption = "AI generated meme"
                elif "/memes/human/" in lower:
                    creator = "human"
                    default_caption = "User meme"
                else:
                    creator = "human"
                    default_caption = "User meme"

                Meme.objects.create(
                    template=None,
                    image=url,
                    caption=default_caption,
                    created_by=creator,
                    format="macro",
                    topic=topic,
                )
                imported += 1

        # 다음 페이지 없으면 종료
        next_cursor = resp.get("next_cursor")
        if not next_cursor:
            break

    return Response({
        "imported_count": imported,
        "skipped_duplicates": skipped,
        "folder": folder,
        "type": type_,
    }, status=201)



class UserMemeUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get("image_file")
        if not file_obj:
            return Response({"error": "image_file required"}, status=400)

        caption = request.data.get("caption", "")
        topic = request.data.get("topic", "")
        template_id = request.data.get("template_id")

        template_id = request.data.get("template_id")
        template = None

        if template_id:
            try:
                # id or public_id erlaubt
                if template_id.isdigit():
                    template = MemeTemplate.objects.get(id=int(template_id))
                else:
                    template = MemeTemplate.objects.filter(image__icontains=template_id).first()
            except MemeTemplate.DoesNotExist:
                return Response({"error": "template not found"}, status=404)
        else:
            template = MemeTemplate.objects.first()

        #  topic default
        if not topic and template:
            topic = template.category.name

        # Cloudinary upload
        upload_result = cloudinary.uploader.upload(
            file_obj,
            folder="memes/human/",
            resource_type="image"
        )

        #  format
        format_value = request.data.get("format") or (template.description if template else "macro")

        #  Meme generated
        meme = Meme.objects.create(
            template=template,
            image=upload_result["secure_url"],
            caption=caption,
            created_by="human",
            format=format_value,  #
            topic=topic,
        )

        serializer = MemeSerializer(meme)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



# @api_view(["GET"])
# def list_cloudinary_templates(request):
#     try:
#         result = cloudinary.api.resources(
#             type="upload",
#             prefix="templates/",  # templates
#             max_results=50
#         )
#         images = [
#             {
#                 "url": item["secure_url"],
#                 "public_id": item["public_id"]
#             }
#             for item in result.get("resources", [])
#         ]
#         return Response({"templates": images})
#     except Exception as e:
#         return Response({"error": str(e)}, status=500)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def list_or_import_cloudinary_templates(request):
    """
    GET  → Cloudinary 'templates/' 폴더 내 이미지 목록 조회 (미리보기용)
    POST → Cloudinary에서 'templates/' 이미지들을 MemeTemplate DB에 등록
    """
    if request.method == "GET":
        # 🔹 단순 조회
        try:
            result = cloudinary.api.resources(
                type="upload",
                prefix="templates/",
                max_results=100
            )
            images = [
                {
                    "url": item["secure_url"],
                    "public_id": item["public_id"]
                }
                for item in result.get("resources", [])
            ]
            return Response({"templates": images}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    # 🔹 POST 요청 시 → DB에 import
    category_name = request.data.get("category", "General")
    category, _ = Category.objects.get_or_create(name=category_name)
    imported, skipped = 0, 0
    next_cursor = None

    while True:
        try:
            resp = cloudinary.api.resources(
                type="upload",
                prefix="templates/",
                max_results=100,
                next_cursor=next_cursor
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
            if MemeTemplate.objects.filter(image=url).exists():
                skipped += 1
                continue

            MemeTemplate.objects.create(
                category=category,
                image=url,
                description="Imported from Cloudinary"
            )
            imported += 1

        next_cursor = resp.get("next_cursor")
        if not next_cursor:
            break

    return Response({
        "imported_count": imported,
        "skipped_duplicates": skipped,
        "category": category_name
    }, status=201)









@api_view(["GET"])
def random_memes(request):
    human_qs = Meme.objects.filter(created_by__iexact="human") \
        .exclude(image__isnull=True).exclude(image="")
    ai_qs = Meme.objects.filter(created_by__iexact="ai") \
        .exclude(image__isnull=True).exclude(image="")

    human_memes = list(human_qs)
    ai_memes = list(ai_qs)

    print(f"HUMAN MEMES: {len(human_memes)}")
    print(f"AI MEMES: {len(ai_memes)}")

    if not human_memes or not ai_memes:
        return Response({"error": "Not enough memes"}, status=400)

    import random
    selected_human = random.choice(human_memes)
    selected_ai = random.choice(ai_memes)

    serializer = MemeSerializer([selected_human, selected_ai], many=True)
    return Response(serializer.data)


@api_view(["POST"])
def vote_meme(request):
    meme_id = request.data.get("meme_id")
    # humor = request.data.get("humor_score", 5)
    # creativity = request.data.get("creativity_score", 5)
    # cultural = request.data.get("cultural_score", 5)
    # user_id = request.data.get("user_id", "anonymous")

    if not meme_id:
        return Response({"error": "meme_id required"}, status=400)

    try:
        meme = Meme.objects.get(id=meme_id)
    except Meme.DoesNotExist:
        return Response({"error": "Meme not found"}, status=404)

 # for votingsystem
    # evaluation = Evaluation.objects.create(
    #     meme=meme,
    #     humor_score=humor,
    #     creativity_score=creativity,
    #     cultural_score=cultural,
    #     user_id=user_id
    # )
    # all_evals = meme.evaluations.all()
    # total_votes = all_evals.count()
    # meme.humor_avg = sum(e.humor_score for e in all_evals) / total_votes
    # meme.creativity_avg = sum(e.creativity_score for e in all_evals) / total_votes
    # meme.cultural_avg = sum(e.cultural_score for e in all_evals) / total_votes
    # meme.total_votes = total_votes
    # meme.save(update_fields=["humor_avg", "creativity_avg", "cultural_avg", "total_votes"])
    #
    # print(f" Meme {meme_id} voted with {humor}/{creativity}/{cultural}")
    # return Response({
    #     "success": True,
    #     "meme_id": meme.id,
    #     "total_votes": total_votes,
    #     "avg_scores": {
    #         "humor": meme.humor_avg,
    #         "creativity": meme.creativity_avg,
    #         "cultural": meme.cultural_avg,
    #     },
    # })

    meme.total_votes = meme.total_votes + 1
    meme.save(update_fields=["total_votes"])
    return Response({"success": True, "total_votes": meme.total_votes})





@api_view(["POST"])
def report_meme(request):
    meme_id = request.data.get("meme_id")
    print(f"meme {meme_id} reported!")

    return Response({"success": True})


@api_view(["GET"])
@permission_classes([AllowAny])
def leaderboard(request):
    """
    Returns top memes sorted by total_votes
    """
    memes = Meme.objects.all().order_by("-total_votes")[:10]
    serializer = MemeSerializer(memes, many=True)

    return Response(serializer.data)

=======
        created_memes.append(MemeSerializer(meme).data)

    # 3️⃣ 완성된 밈 리스트 반환
    return Response(created_memes)
>>>>>>> origin/main
