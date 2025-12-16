import math
import os

from django.conf import settings
from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from rest_framework.decorators import permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
import time
import random
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
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

# ELO helpers
K_FACTOR = 32  # between 16 and 40


def elo_expected(rating_a: float, rating_b: float) -> float:
    return 1.0 / (1.0 + math.pow(10.0, (rating_b - rating_a) / 400.0))


def elo_update(rating_a: float, rating_b: float, score_a: float, k: float = K_FACTOR) -> float:
    expected_a = elo_expected(rating_a, rating_b)
    return rating_a + k * (score_a - expected_a)


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


# =========================
# Weekly topic
# =========================
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

@api_view(["GET"])
def topic_list(request):
    topics = WeeklyTopic.objects.all().order_by("id")
    return Response([{"id": t.id, "name": t.name} for t in topics])



# Multiple AI memes generate
@api_view(["POST"])
def generate_multiple_ai_memes(request):

    SOFT_TIME_LIMIT = 25

    t0 = time.time()

    try:
        current_topic = get_current_topic_or_400()
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    try:
        count = int(request.data.get("count", 2))
    except Exception:
        count = 2

    if count < 1:
        count = 1

    if count > 2:
        count = 2

    # template filter
    template_ids = request.data.get("template_ids") or []
    if template_ids:
        templates_qs = MemeTemplate.objects.filter(id__in=template_ids)
    else:
        templates_qs = MemeTemplate.objects.all()

    templates = list(templates_qs)
    if not templates:
        return Response({"error": "No templates available"}, status=status.HTTP_400_BAD_REQUEST)

    created_memes = []

    # limit open ai calls
    MAX_OPENAI_CALLS = 1
    openai_calls = 0

    MAX_ITERATIONS = max(4, count * 3)

    used_template_ids = set()

    for _ in range(MAX_ITERATIONS):
        if time.time() - t0 > SOFT_TIME_LIMIT:
            print("generate_multiple_ai_memes: soft time limit reached, breaking.")
            break

        if len(created_memes) >= count:
            break
        if openai_calls >= MAX_OPENAI_CALLS:
            break

        template = random.choice(templates)
        if template.id in used_template_ids and len(used_template_ids) < len(templates):
            template = random.choice(templates)
        used_template_ids.add(template.id)

        category_name = template.category.name if template.category else ""
        template_desc = template.description or ""

        try:
            template_image_url = template.image.url
        except Exception:
            template_image_url = str(template.image)

        if not template_image_url:
            continue

        template_image_url = template_image_url.replace("http://", "https://")

        print("generate_multiple_ai_memes: OpenAI call for template", template.id)

        # 6) OpenAI 호출
        design = generate_ai_meme_design(
            topic=current_topic,
            category_name=category_name,
            template_desc=template_desc,
            template_url=template_image_url,
        )
        openai_calls += 1

        if not isinstance(design, dict):
            print("AI design invalid type:", type(design))
            continue

        if "error" in design:
            print("AI design error for template", template.id, design)
            continue

        designs = design.get("designs")
        if not isinstance(designs, list) or len(designs) == 0:
            print("AI design has no designs:", design)
            continue

        blocks = designs[0]
        if not isinstance(blocks, list) or len(blocks) == 0:
            print("AI design first blocks invalid:", blocks)
            continue

        valid_blocks = []
        for b in blocks:
            if not isinstance(b, dict):
                continue
            text = (b.get("text") or "").strip()
            if not text:
                continue
            valid_blocks.append(b)

        if not valid_blocks:
            print("No valid blocks after filtering.")
            continue

        try:
            public_id = apply_ai_text_to_image(template_image_url, valid_blocks)
        except Exception as e:
            print("apply_ai_text_to_image error:", repr(e))
            continue

        # 8) DB 저장
        full_caption = " / ".join([(b.get("text") or "").strip() for b in valid_blocks]).strip()
        if not full_caption:
            full_caption = "AI meme"

        try:
            meme = Meme.objects.create(
                template=template,
                image=public_id,      # Cloudinary public_id
                caption=full_caption,
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
            {
                "error": "AI memes could not be generated",
                "detail": "No memes were created within limits. Try again.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    data = MemeSerializer(created_memes, many=True).data
    return Response(
        {
            "created": len(created_memes),
            "requested": count,
            "openai_calls": openai_calls,
            "topic": current_topic,
            "memes": data,
        },
        status=status.HTTP_201_CREATED,
    )



@api_view(["POST"])
def generate_ai_meme(request):
    template_id = request.data.get("template")
    if not template_id:
        return Response({"error": "template id required"}, status=status.HTTP_400_BAD_REQUEST)

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
            return Response({"error": "Template image URL missing"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # count = meme desing max 3 .
    try:
        requested_count = int(request.data.get("count", 3))
    except Exception:
        requested_count = 3
    requested_count = max(1, min(requested_count, 3))

    design = generate_ai_meme_design(
        topic=current_topic,
        category_name=category_name,
        template_desc=template_desc,
        template_url=template_image_url,
    )

    if "error" in design:
        return Response(design, status=status.HTTP_502_BAD_GATEWAY)

    designs = design.get("designs") or []
    if not designs:
        return Response({"error": "No captions generated from AI"}, status=status.HTTP_502_BAD_GATEWAY)

    designs = designs[:requested_count]

    created_memes = []

    for blocks in designs:
        if not isinstance(blocks, list) or not blocks:
            continue

        try:
            public_id = apply_ai_text_to_image(template_image_url, blocks)  # ✅ blocks 묶음 그대로
        except Exception as e:
            print("apply_ai_text_to_image error:", repr(e))
            continue

        full_caption = " / ".join([b.get("text", "") for b in blocks]).strip()

        try:
            meme = Meme.objects.create(
                template=template,
                image=public_id,
                caption=full_caption,
                created_by="ai",
                format="macro",
                topic=current_topic,
            )
            created_memes.append(meme)
        except Exception as e:
            print("Meme create error:", repr(e))
            continue

    if not created_memes:
        return Response({"error": "AI memes could not be generated"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    serializer = MemeSerializer(created_memes, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

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


# User meme upload
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

        # AI balance (최대 1개만 생성)
        try:
            ensure_ai_balance_for_topic(
                topic=current_topic,
                base_template=template,
                min_ratio=0.7,
                max_diff=3,
                max_new=1,
            )
        except Exception as e:
            print("AI balance error:", repr(e))

        return Response(MemeSerializer(meme).data, status=201)


# Random pair for voting
@api_view(["GET"])
def random_memes(request):
    try:
        current_topic = get_current_topic_or_400()
    except Exception as e:
        return Response({"error": str(e)}, status=400)

    qs = Meme.objects.filter(
        topic=current_topic,
    ).exclude(image="")

    total = qs.count()
    if total < 2:
        return Response({"error": "Not enough memes"}, status=400)

    ids = list(qs.values_list("id", flat=True))
    chosen_ids = random.sample(ids, 2)

    memes = list(Meme.objects.filter(id__in=chosen_ids))
    return Response(MemeSerializer(memes, many=True).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def vote_meme(request):
    print("VOTE REQUEST DATA:", request.data)

    winner_id = request.data.get("winner_id")
    loser_id = request.data.get("loser_id")

    if not winner_id or not loser_id:
        print("missing winner_id/loser_id")
        return Response(
            {"error": "winner_id and loser_id required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        winner_id = int(winner_id)
        loser_id = int(loser_id)
    except (TypeError, ValueError):
        print("invalid id values:", winner_id, loser_id)
        return Response(
            {"error": "winner_id and loser_id must be integers"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if winner_id == loser_id:
        return Response(
            {"error": "winner_id and loser_id must be different"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        winner = Meme.objects.get(id=winner_id)
        loser = Meme.objects.get(id=loser_id)
    except Meme.DoesNotExist:
        print("meme not found:", winner_id, loser_id)
        return Response({"error": "meme not found"}, status=status.HTTP_404_NOT_FOUND)

    if winner.topic != loser.topic:
        print("topic mismatch:", winner.topic, loser.topic)
        return Response(
            {"error": "memes must belong to the same topic"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    r_w = winner.rating if getattr(winner, "rating", None) is not None else 1000.0
    r_l = loser.rating if getattr(loser, "rating", None) is not None else 1000.0

    try:
        new_r_w = elo_update(r_w, r_l, score_a=1.0)  # winner
        new_r_l = elo_update(r_l, r_w, score_a=0.0)  # loser

        winner.rating = new_r_w
        loser.rating = new_r_l

        winner.total_votes = (winner.total_votes or 0) + 1
        # loser.total_votes = (loser.total_votes or 0) + 1

        winner.save()
        loser.save()
    except Exception as e:
        print("vote_meme internal error:", repr(e))
        return Response(
            {"error": "internal_error", "detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            "success": True,
            "winner_id": winner.id,
            "loser_id": loser.id,
            "winner_rating": winner.rating,
            "loser_rating": loser.rating,
        },
        status=status.HTTP_200_OK,
    )

# Todo : how to report??
@api_view(["POST"])
def report_meme(request):
    print("Meme reported:", request.data.get("meme_id"))
    return Response({"success": True})


@api_view(["GET"])
def leaderboard_memes(request):
    topic = request.query_params.get("topic")

    if not topic:
        try:
            topic = get_current_topic_or_400()
        except Exception:
            return Response({"error": "no_active_topic"}, status=400)

    memes = Meme.objects.filter(topic=topic).order_by("-rating")[:10]
    return Response(MemeSerializer(memes, many=True).data)

@api_view(["GET"])
def leaderboard_humans_vs_ai(request):

    humans = Meme.objects.filter(created_by="human")
    ai = Meme.objects.filter(created_by="ai")

    human_top10 = humans.order_by("-rating")[:10]
    ai_top10 = ai.order_by("-rating")[:10]

    def summary(qs):
        total_votes = sum(m.total_votes for m in qs)
        count = qs.count()
        avg = total_votes / count if count else 0
        return {
            "total_votes": total_votes,
            "count": count,
            "avg": round(avg, 1)
        }

    return Response({
        "summary": {
            "human": summary(humans),
            "ai": summary(ai)
        },
        "human_top10": MemeSerializer(human_top10, many=True).data,
        "ai_top10": MemeSerializer(ai_top10, many=True).data,
    })


@api_view(["GET"])
def leaderboard_top_memes(request):
    memes = Meme.objects.all().order_by("-rating")[:10]
    return Response({"top10": MemeSerializer(memes, many=True).data})