# 파일 위치: backend/app/models/feedback.py

from pydantic import BaseModel, Field
from datetime import datetime

class FeedbackInDB(BaseModel):
    """
    MongoDB의 'user_feedback' 컬렉션에 저장되는 완전한 형태의 데이터 모델입니다.
    """
    id: str = Field(..., alias="_id")
    user_id: str
    event_id: str
    feedback_type: str # "is_work", "distraction_ignored" 등
    timestamp: datetime

    class Config:
        allow_population_by_field_name = True
        orm_mode = True