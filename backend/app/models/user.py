# backend/app/models/user.py

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId

from app.models.common import PyObjectId


class UserInDB(BaseModel):
    """
    User 공통 도메인 모델

    ✔ 플랫폼 독립 (web / mobile / desktop 공용)
    ✔ 인증(Auth) 정보는 포함하지 않음
    ✔ '이 사용자가 누구인가'와 상태만 표현
    """

    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    email: EmailStr
    google_id: str

    # timezone-aware UTC로 통일
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login_at: Optional[datetime] = None

    # 사용자 설정(선호/정책). ML/세션은 여기 데이터를 참고만 함.
    settings: Dict[str, Any] = Field(default_factory=dict)

    # 멀티 디바이스 지원
    fcm_tokens: List[str] = Field(default_factory=list)

    # 차단 "정책(후보군)" - 실제 차단 시점은 ML/세션이 판단
    blocked_apps: List[str] = Field(default_factory=list)

    model_config = {
        "populate_by_name": True,          # allow_population_by_field_name 대응
        "arbitrary_types_allowed": True,
        "from_attributes": True,           # orm_mode 대응
    }

