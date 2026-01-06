# backend/app/schemas/session.py

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# --- API 요청(Request) 스키마 ---

class SessionCreate(BaseModel):
    """
    [요청] POST /sessions/start
    새로운 집중 세션 시작
    """
    task_id: Optional[str] = None
    start_time: datetime
    goal_duration: Optional[float] = None  # 목표 집중 시간 (분 단위)

    # ML 모델 도입전 실험적 필드
    profile_id: Optional[str] = None


class SessionUpdate(BaseModel):
    """
    [요청] PUT /sessions/{session_id}
    진행 중인 세션 업데이트 (종료 시 end_time/status 포함)
    """
    end_time: Optional[datetime] = None
    status: Optional[str] = None  # "completed", "cancelled" 등
    goal_duration: Optional[float] = None
    interruption_count: Optional[int] = None


# --- API 응답(Response) 스키마 ---

class SessionRead(BaseModel):
    """
    [응답] 세션 반환
    """
    id: str
    user_id: str
    task_id: Optional[str] = None

    profile_id: Optional[str] = None

    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[float] = None  # 초 단위
    status: str
    goal_duration: Optional[float] = None
    interruption_count: int = Field(default=0)

    model_config = {
        "from_attributes": True
    }
