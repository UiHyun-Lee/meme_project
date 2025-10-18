from django.db import models
from memes.models import MemeTemplate

class Evaluation(models.Model):
    meme = models.ForeignKey("memes.Meme", on_delete=models.CASCADE, related_name="evaluations")
    humor_score      = models.IntegerField()
    cultural_score   = models.IntegerField()
    creativity_score = models.IntegerField()
    comment          = models.TextField(blank=True)
    user_id          = models.CharField(max_length=50, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Eval for Meme {self.meme}"

