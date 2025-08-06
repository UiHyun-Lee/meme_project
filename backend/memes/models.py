from django.db import models

class Meme(models.Model):
    FORMAT_CHOICES = [
        ('macro', 'Macro'),
        ('tweet', 'Tweet'),
        ('gif', 'GIF'),
        ('sticker', 'Sticker'),
    ]
    image_url  = models.URLField()
    caption    = models.TextField()
    created_by = models.CharField(max_length=10)  # 'human' or 'ai'
    format     = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    topic      = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.format} by {self.created_by}"
