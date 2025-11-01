# 파일 위치: backend/app/models/user.py (또는 schemas/user.py)
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List, Dict

class UserInDB(BaseModel):
    """
    MongoDB에 저장되는 완전한 형태의 User 모델입니다.
    데이터 모델링 표의 내용을 코드로 구체화한 것입니다.
    """
    # MongoDB의 고유 ID인 "_id"를 "id" 필드로 사용하기 위한 설정입니다.
    id: str = Field(..., alias="_id")
    
    # EmailStr 타입을 사용하여 이메일 형식을 자동으로 검증합니다.
    email: EmailStr
    
    # password_hash는 API 응답에는 절대 포함되지 않아야 합니다.
    password_hash: str
    
    # 표의 'timestamp'는 Python의 'datetime' 객체로 매핑됩니다.
    created_at: datetime = Field(default_factory=datetime.now)
    last_login_at: Optional[datetime] = None
    
    # 표의 'map'은 Python의 'dict'로, 더 구체적인 스키마를 정의할 수도 있습니다.
    settings: Dict[str, any] = {}
    
    # fcm_token은 Optional일 수 있습니다 (모바일 앱을 사용하지 않는 경우).
    fcm_token: Optional[str] = None
    
    # 표의 'array<string>'은 Python의 'List[str]'로 표현됩니다.
    blocked_apps: List[str] = []

    class Config:
        # MongoDB의 "_id"를 "id"로 매핑할 수 있도록 허용합니다.
        allow_population_by_field_name = True
        # ORM 모델처럼 객체 속성으로 접근할 수 있게 합니다.
        orm_mode = True