# 파일 위치: backend/app/schemas/notification.py

from pydantic import BaseModel
from typing import Dict, Any

class NotificationPayload(BaseModel):
    """
    [내부용] 알림 전송 시 사용되는 공통 데이터 구조입니다.
    (API 명세서의 POST /notifications/... API들의 요청 본문과 일치)
    """
    user_id: str
    message_type: str # 예: "session_start", "session_end", "update_profile"
    data: Dict[str, Any] = {} # 알림과 함께 보낼 추가 데이터