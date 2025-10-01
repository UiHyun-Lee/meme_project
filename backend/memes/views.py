from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Category, MemeTemplate, Meme
from .serializers import CategorySerializer, MemeTemplateSerializer, MemeSerializer
from .services import generate_ai_caption, create_meme_image

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

    try:
        template = MemeTemplate.objects.get(id=template_id)
    except MemeTemplate.DoesNotExist:
        return Response({"error": "Template not found"}, status=404)

    # AI caption generate
    caption = generate_ai_caption(template.category.name, template.description or "")

    # img & Cloudinary upload
    final_url = create_meme_image(template.image.url, caption)

    # Meme save
    meme = Meme.objects.create(
        template=template,
        image=final_url,
        caption=caption,
        created_by="ai",
        format="macro",
        topic=template.category.name
    )

    return Response(MemeSerializer(meme).data)