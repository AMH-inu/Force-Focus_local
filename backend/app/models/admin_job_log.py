# 파일 위치: backend/app/models/admin_job_log.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any

class AdminJobLogInDB(BaseModel):
    """
    MongoDB의 'admin_job_logs' 컬렉션에 저장될 관리 작업 이력 데이터 모델입니다.
    """
    id: str = Field(..., alias="_id") # JobStatusResponse의 job_id와 동일한 값
    job_type: str # "ml_retrain", "data_cleanup" 등
    triggered_by: str # "manual", "scheduler" 등
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    status: str # "pending", "running", "completed", "failed"
    parameters: Dict[str, Any] = {} # 작업 실행 시 전달된 파라미터
    result: Optional[Dict[str, Any]] = None # 작업 결과 (성공 시)
    error_message: Optional[str] = None # 작업 실패 시 에러 메시지

    class Config:
        allow_population_by_field_name = True
        orm_mode = True