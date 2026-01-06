# backend/app/schemas/user.py

from datetime import datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr


# ---------- 요청 스키마 (/users/me/*) ----------

class SettingsPatch(BaseModel):
    """
    [요청] PATCH /users/me/settings
    settings 부분 업데이트(merge)
    """
    settings: Dict[str, Any]


# 기존 코드가 SettingsUpdate를 import해도 안 깨지게 alias 제공
class SettingsUpdate(SettingsPatch):
    """
    (호환용) SettingsPatch와 동일
    """
    pass


class FCMTokenAdd(BaseModel):
    """
    [요청] POST /users/me/fcm-tokens
    단일 FCM 토큰 추가
    """
    token: str


class FCMTokenDelete(BaseModel):
    """
    [요청] DELETE /users/me/fcm-tokens
    - token 미지정 시 전체 삭제
    - {"token": "..."} 또는 {"fcm_token": "..."} 모두 허용(호환)
    """
    # 표준 필드명은 token
    token: Optional[str] = None

    # 호환 필드명 (예전 코드가 payload.fcm_token을 쓰는 경우 대비)
    fcm_token: Optional[str] = None

    def resolved_token(self) -> Optional[str]:
        """
        endpoint에서 어떤 필드를 쓰든 안전하게 하나로 합치기 위한 헬퍼
        """
        return self.token or self.fcm_token


class BlockedAppAdd(BaseModel):
    """
    [요청] POST /users/me/blocked-apps
    차단 앱 후보 추가
    """
    app_name: str


class BlockedAppDelete(BaseModel):
    """
    [요청] DELETE /users/me/blocked-apps
    차단 앱 후보 제거
    """
    app_name: str


# ---------- 응답 스키마 ----------

class UserRead(UserBase):
    id: str
    created_at: datetime
    last_login_at: Optional[datetime] = None

    settings: Dict[str, Any] = Field(default_factory=dict)
    blocked_apps: List[str] = Field(default_factory=list)
    fcm_tokens: List[str] = Field(default_factory=list)

    model_config = {
        "from_attributes": True
    }


class SuccessMessage(BaseModel):
    success: bool = True
    message: str = "Operation successful"
