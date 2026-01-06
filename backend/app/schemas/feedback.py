# backend/app/schemas/feedback.py

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


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
    feedback_type: FeedbackTypeEnum
    timestamp: datetime


class FeedbackRead(BaseModel):
    """
    [응답] GET /feedback, POST /feedback 성공 시 등
    """
    id: str
    user_id: str
    event_id: str
    feedback_type: FeedbackTypeEnum
    timestamp: datetime

    model_config = {
        "from_attributes": True
    }


class FeedbackCreateResponse(BaseModel):
    """
    [응답] POST /feedback 성공 시 (간단 응답 원하면 사용)
    """
    status: str = "success"
    feedback_id: str
