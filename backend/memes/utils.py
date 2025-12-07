
from rest_framework.exceptions import ValidationError
from .models import WeeklyTopic


def get_current_topic_or_400() -> str:
    topic_obj = WeeklyTopic.get_current_topic()
    if not topic_obj:
        raise ValidationError("현재 활성화된 토픽이 없습니다. (관리자에게 문의하세요)")
    return topic_obj.name