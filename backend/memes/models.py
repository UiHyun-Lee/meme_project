from django.db import models
from cloudinary.models import CloudinaryField

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class MemeTemplate(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="templates")
    image = models.ImageField(upload_to="templates/")  # Cloudinary

    description = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category.name} - {self.id}"

class Meme(models.Model):
    template = models.ForeignKey(MemeTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    template = models.ForeignKey(MemeTemplate, on_delete=models.CASCADE, related_name="memes")
    image = models.ImageField(upload_to="memes/")
    caption = models.TextField()
    created_by = models.CharField(max_length=20)   # "human" or "ai"
    format = models.CharField(max_length=50)
    topic = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    humor_avg = models.FloatField(default=0)
    creativity_avg = models.FloatField(default=0)
    cultural_avg = models.FloatField(default=0)
    total_votes = models.IntegerField(default=0)


    def __str__(self):
        return f"Meme {self.id} from {self.template.category.name}"

# from django.db import models
# from cloudinary.models import CloudinaryField
#
# class Category(models.Model):
#     name = models.CharField(max_length=100, unique=True)
#     description = models.TextField(blank=True, null=True)
#
#     def __str__(self):
#         return self.name
#
#
# class MemeTemplate(models.Model):
#     category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="templates")
#     image = CloudinaryField('image')
#
#     description = models.CharField(max_length=255, blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     def __str__(self):
#         return f"{self.category.name} - {self.id}"
#
# class Meme(models.Model):
#     template = models.ForeignKey(MemeTemplate, on_delete=models.SET_NULL, null=True, blank=True)
#     template = models.ForeignKey(MemeTemplate, on_delete=models.CASCADE, related_name="memes")
#     image = CloudinaryField('image')
#     caption = models.TextField()
#     created_by = models.CharField(max_length=20)   # "human" or "ai"
#     format = models.CharField(max_length=50)
#     topic = models.CharField(max_length=100, blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     humor_avg = models.FloatField(default=0)
#     creativity_avg = models.FloatField(default=0)
#     cultural_avg = models.FloatField(default=0)
#     total_votes = models.IntegerField(default=0)
#
#
#     def __str__(self):
#         return f"Meme {self.id} from {self.template.category.name}"