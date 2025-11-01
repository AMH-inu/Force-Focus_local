# 파일 위치: backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List

# --- 기본 User 스키마 ---
class UserBase(BaseModel):
    email: EmailStr  # Pydantic이 이메일 형식을 자동으로 검증합니다.

# --- API별 요청(Request) 스키마 ---

class UserCreate(UserBase):
    """
    [요청] POST /users/register
    회원가입 시 클라이언트가 보내는 데이터 구조입니다.
    """
    password: str

class UserLogin(BaseModel):
    """
    [요청] POST /users/login
    로그인 시 클라이언트가 보내는 데이터 구조입니다.
    FastAPI의 OAuth2PasswordRequestForm은 'username' 필드를 사용하므로,
    클라이언트는 'username' 필드에 이메일을 담아 보내야 합니다.
    """
    username: EmailStr
    password: str

class SettingsUpdate(BaseModel):
    """
    [요청] PUT /users/me/settings
    사용자 설정을 업데이트할 때 보내는 데이터 구조입니다.
    모든 필드는 선택 사항(Optional)입니다.
    """
    notification_preferences: Optional[str] = None
    theme_preference: Optional[str] = None

# --- API별 응답(Response) 스키마 ---

class UserRead(UserBase):
    """
    [응답] GET /users/me 또는 회원가입 성공 시
    서버가 클라이언트에게 보내주는 사용자 정보 데이터 구조입니다.
    보안을 위해 password 필드는 포함되지 않습니다.
    """
    id: str
    settings: Optional[dict] = None
    blocked_apps: Optional[List[str]] = []

class FCMTokenDelete(BaseModel):
    """
    [요청] DELETE /users/me/fcm_token
    특정 FCM 토큰을 삭제할 때 클라이언트가 보내는 데이터 구조입니다.
    이 필드는 선택 사항이며, 없을 경우 현재 사용자에게 연결된 모든 토큰을 삭제합니다.
    """
    fcm_token: Optional[str] = None

class SuccessMessage(BaseModel):
    """
    [응답] 일반적인 성공 메시지
    """
    success: bool = True
    message: str = "Operation successful"