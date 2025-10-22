from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Category, MemeTemplate, Meme
from .serializers import CategorySerializer, MemeTemplateSerializer, MemeSerializer
from .services import generate_ai_meme_design, apply_ai_text_to_image
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import base64
from django.core.files.base import ContentFile
import uuid

@api_view(["POST"])
def upload_meme(request):
    """
    Upload user-created meme to database
    """
    try:
        # Extract data from request
        template_id = request.data.get("template_id")
        image_data = request.data.get("image")  # Base64 encoded image
        caption = request.data.get("caption", "")
        created_by = request.data.get("created_by", "human")
        topic = request.data.get("topic", "School")
        
        if not template_id or not image_data:
            return Response(
                {"error": "template_id and image are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get template
        try:
            template = MemeTemplate.objects.get(id=template_id)
        except MemeTemplate.DoesNotExist:
            return Response(
                {"error": "Template not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Process base64 image data
        if ',' in image_data:
            format, imgstr = image_data.split(';base64,')
        else:
            imgstr = image_data
            
        image_data_decoded = base64.b64decode(imgstr)
        
        # Create unique filename
        file_name = f"meme_{uuid.uuid4().hex[:10]}.jpg"
        
        # Create Meme object
        meme = Meme(
            template=template,
            caption=caption,
            created_by=created_by,
            format="macro",
            topic=topic
        )
        
        # Save image to ImageField
        meme.image.save(
            file_name, 
            ContentFile(image_data_decoded), 
            save=True
        )
        
        serializer = MemeSerializer(meme)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {"error": f"Failed to upload meme: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


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
