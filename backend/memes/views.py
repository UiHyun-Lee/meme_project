from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, MemeTemplate, Meme
from .serializers import CategorySerializer, MemeTemplateSerializer, MemeSerializer
from .services import generate_ai_meme_design, apply_ai_text_to_image
import cloudinary.api
import os
import cloudinary


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
    template_id = request.data.get("template")
    if not template_id:
        return Response({"error": "template id required"}, status=400)

    try:
        template = MemeTemplate.objects.get(id=template_id)
    except MemeTemplate.DoesNotExist:
        return Response({"error": "Template not found"}, status=404)

    design = generate_ai_meme_design(
        category_name=template.category.name,
        template_desc=template.description or "",
        template_url=template.image.url
    )

    if "error" in design:
        return Response(design, status=500)

    memes_data = design.get("memes", [])
    created_memes = []

    for meme_design in memes_data:
        captions = meme_design.get("captions", [])
        final_url = apply_ai_text_to_image(template.image.url, captions)

        upload_result = cloudinary.uploader.upload(
            final_url,
            folder="memes/ai/",
            resource_type="image"
        )

        meme = Meme.objects.create(
            template=template,
            image=upload_result["secure_url"],
            caption="; ".join([c["text"] for c in captions]),
            created_by="ai",
            format="macro",
            topic=template.category.name
        )

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

    folder = request.data.get("folder")
    type_ = request.data.get("type", "template")
    topic = request.data.get("topic", "")
    category_name = request.data.get("category", "General")

    if not folder:
        return Response({"error": "folder required"}, status=400)

    try:
        resources = cloudinary.api.resources(type="upload", prefix=folder, max_results=100)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

    category, _ = Category.objects.get_or_create(name=category_name)
    created = []

    for res in resources.get("resources", []):
        url = res.get("secure_url")
        if not url:
            continue

        if type_ == "template":
            if MemeTemplate.objects.filter(image=url).exists():
                continue
            MemeTemplate.objects.create(
                category=category,
                image=url,
                description="Imported from Cloudinary"
            )
        elif type_ == "meme":
            if Meme.objects.filter(image=url).exists():
                continue
            Meme.objects.create(
                template=None,
                image=url,
                caption="AI generated meme",
                created_by="ai",
                format="macro",
                topic=topic,
            )
        created.append(url)

    return Response({"imported_count": len(created)}, status=201)


class UserMemeUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get("image_file")
        if not file_obj:
            return Response({"error": "image_file required"}, status=400)

        caption = request.data.get("caption", "")
        topic = request.data.get("topic", "")
        template_id = request.data.get("template_id")

        # ✅ 템플릿 확인
        template_id = request.data.get("template_id")
        template = None

        if template_id:
            try:
                # id (숫자) or public_id (문자열) 모두 허용
                if template_id.isdigit():
                    template = MemeTemplate.objects.get(id=int(template_id))
                else:
                    template = MemeTemplate.objects.filter(image__icontains=template_id).first()
            except MemeTemplate.DoesNotExist:
                return Response({"error": "template not found"}, status=404)
        else:
            template = MemeTemplate.objects.first()

        # ✅ topic 기본값 처리
        if not topic and template:
            topic = template.category.name

        # ✅ Cloudinary 업로드
        upload_result = cloudinary.uploader.upload(
            file_obj,
            folder="memes/human/",
            resource_type="image"
        )

        # ✅ format 처리 (프론트에서 넘어오거나, 템플릿 설명 사용)
        format_value = request.data.get("format") or (template.description if template else "macro")

        # ✅ Meme 생성
        meme = Meme.objects.create(
            template=template,
            image=upload_result["secure_url"],
            caption=caption,
            created_by="human",
            format=format_value,  # ✅ 여기가 핵심 수정
            topic=topic,
        )

        serializer = MemeSerializer(meme)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



@api_view(["GET"])
def list_cloudinary_templates(request):
    try:
        result = cloudinary.api.resources(
            type="upload",
            prefix="templates/",  # templates
            max_results=50
        )
        images = [
            {
                "url": item["secure_url"],
                "public_id": item["public_id"]
            }
            for item in result.get("resources", [])
        ]
        return Response({"templates": images})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
