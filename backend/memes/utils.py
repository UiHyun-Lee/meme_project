
from rest_framework.exceptions import ValidationError
from .models import WeeklyTopic


def get_current_topic_or_400() -> str:
    topic_obj = WeeklyTopic.get_current_topic()
    if not topic_obj:
        raise ValidationError("No active topics now!")
    return topic_obj.name