# 파일 위치: backend/app/schemas/feedback.py

from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class FeedbackTypeEnum(str, Enum):
    """피드백의 종류를 정의하는 Enum"""
    IS_WORK = "is_work"
    DISTRACTION_IGNORED = "distraction_ignored"

class FeedbackCreate(BaseModel):
    """
    [요청] POST /feedback
    사용자가 시스템의 개입에 대해 피드백을 제출할 때 보내는 데이터 구조입니다.
    """
    event_id: str
    feedback_type: FeedbackTypeEnum # 정의된 Enum 타입을 사용하여 데이터의 일관성을 보장합니다.
    timestamp: datetime