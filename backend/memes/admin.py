import csv

from django.contrib import admin
from django.http import HttpResponse

from .models import Category, MemeTemplate, Meme, WeeklyTopic

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description")
    search_fields = ("name",)

@admin.register(MemeTemplate)
class MemeTemplateAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "description", "created_at")
    list_filter = ("category",)
    search_fields = ("description",)

@admin.action(description="Export selected memes to CSV")
def export_memes_csv(modeladmin, request, queryset):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="memes_elo.csv"'

    writer = csv.writer(response)
    writer.writerow(["MemeID", "MemeType", "Topic", "Elo"])

    for meme in queryset:
        writer.writerow([
            meme.id,
            meme.created_by,
            meme.topic,
            meme.rating,
        ])

    return response

@admin.register(Meme)
class MemeAdmin(admin.ModelAdmin):
    list_display = ("id", "created_by", "topic", "template", "created_at")
    list_filter = ("created_by", "topic", "template")
    search_fields = ("caption", "topic")

    readonly_fields = ("image_preview",)

    actions = [export_memes_csv]

    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="120" style="border-radius:8px" />'
        return "(no image)"
    image_preview.allow_tags = True
    image_preview.short_description = "Image Preview"

@admin.register(WeeklyTopic)
class WeeklyTopicAdmin(admin.ModelAdmin):
    list_display = ("name", "start_date", "end_date", "is_active")
    list_filter = ("is_active",)