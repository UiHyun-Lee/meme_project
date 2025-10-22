from django.contrib import admin
from .models import Category, MemeTemplate, Meme

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description")
    search_fields = ("name",)

@admin.register(MemeTemplate)
class MemeTemplateAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "description", "created_at")
    list_filter = ("category",)
    search_fields = ("description",)

@admin.register(Meme)
class MemeAdmin(admin.ModelAdmin):
    list_display = ("id", "created_by", "topic", "template", "created_at")
    list_filter = ("created_by", "topic", "template")
    search_fields = ("caption", "topic")

    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="120" style="border-radius:8px" />'
        return "(no image)"
    image_preview.allow_tags = True
    image_preview.short_description = "Image Preview"
