from django.db import models

from memes.models import Meme

class Evaluation(models.Model):
    meme             = models.ForeignKey(Meme, on_delete=models.CASCADE)
    humor_score      = models.IntegerField()
    cultural_score   = models.IntegerField()
    creativity_score = models.IntegerField()
    comment          = models.TextField(blank=True)
    user_id          = models.CharField(max_length=50, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Eval for Meme {self.meme_id}"

