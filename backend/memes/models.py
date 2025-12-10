from django.db import models
from cloudinary.models import CloudinaryField
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=500, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class MemeTemplate(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="templates")
    image = CloudinaryField('image')

    description = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category.name} - {self.id}"

class Meme(models.Model):
    template = models.ForeignKey(
        MemeTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="memes"
    )
    image = CloudinaryField('image')
    caption = models.TextField()
    created_by = models.CharField(max_length=20)   # "human" or "ai"
    format = models.CharField(max_length=50)
    topic = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # humor_avg = models.FloatField(default=0)
    # creativity_avg = models.FloatField(default=0)
    # cultural_avg = models.FloatField(default=0)
    total_votes = models.IntegerField(default=0)

    def __str__(self):
        return f"Meme {self.id} from {self.template.category.name if self.template else 'no template'}"


class WeeklyTopic(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.name} ({self.start_date} ~ {self.end_date})"

    @classmethod
    def get_current_topic(cls):
        today = timezone.now().date()
        return (
            cls.objects.filter(
                is_active=True,
                start_date__lte=today,
                end_date__gte=today,
            )
            .order_by("-start_date")
            .first()
        )