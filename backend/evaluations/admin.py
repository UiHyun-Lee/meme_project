from django.contrib import admin
from .models import Evaluation

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ("id", "meme", "humor_score", "creativity_score", "cultural_score", "created_at")
