# 파일 위치: backend/app/models/notification_log.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any, Optional

class NotificationLogInDB(BaseModel):
    """
    MongoDB의 'notification_logs' 컬렉션에 저장될 알림 이력 데이터 모델입니다.
    """
    id: str = Field(..., alias="_id")
    user_id: str
    message_type: str # 예: "session_end", "distraction_alert"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str # "sent", "failed", "delivered" 등
    channel: str # "fcm", "desktop" 등
    payload: Dict[str, Any] # 전송된 알림의 실제 내용
    error_message: Optional[str] = None # 전송 실패 시 에러 메시지

    class Config:
        allow_population_by_field_name = True
        orm_mode = True