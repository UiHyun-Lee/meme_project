from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Category, MemeTemplate, Meme
from .serializers import CategorySerializer, MemeTemplateSerializer, MemeSerializer
from .services import generate_ai_meme_design, apply_ai_text_to_image


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
    """
    Cloudinary의 실제 이미지를 기반으로,
    AI가 텍스트+스타일 JSON 생성 → Pillow로 합성 → Cloudinary 업로드 → DB 저장
    """
    template_id = request.data.get("template")
    if not template_id:
        return Response({"error": "template id required"}, status=400)

    try:
        template = MemeTemplate.objects.get(id=template_id)
    except MemeTemplate.DoesNotExist:
        return Response({"error": "Template not found"}, status=404)

    # 1️⃣ LLM 호출 → JSON 생성
    design = generate_ai_meme_design(
        category_name=template.category.name,
        template_desc=template.description or "",
        template_url=template.image.url
    )

    if "error" in design:
        return Response(design, status=500)

    memes_data = design.get("memes", [])
    created_memes = []

    # 2️⃣ 각 밈 디자인 합성 + Cloudinary 업로드
    for meme_design in memes_data:
        captions = meme_design.get("captions", [])
        final_url = apply_ai_text_to_image(template.image.url, captions)

        meme = Meme.objects.create(
            template=template,
            image=final_url,
            caption="; ".join([c["text"] for c in captions]),
            created_by="ai",
            format="macro",
            topic=template.category.name
        )
        created_memes.append(MemeSerializer(meme).data)

    # 3️⃣ 완성된 밈 리스트 반환
    return Response(created_memes)
