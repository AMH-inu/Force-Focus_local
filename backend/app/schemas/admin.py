# 파일 위치: backend/app/schemas/admin.py

from pydantic import BaseModel
from typing import Optional

class MLTrainRequest(BaseModel):
    """
    [요청] POST /admin/ml/train
    ML 모델 재학습을 수동으로 트리거할 때 보내는 데이터 구조입니다.
    """
    user_id: Optional[str] = None # 특정 사용자만 재학습 시킬 경우
    force_retrain: bool = False # 캐시를 무시하고 강제로 재학습 시킬지 여부

class JobStatusResponse(BaseModel):
    """
    [응답] POST /admin/ml/train 성공 시
    백그라운드 작업이 시작되었음을 알리는 응답 데이터 구조입니다.
    """
    job_id: str # 생성된 백그라운드 작업 ID (예: admin_job_logs의 id)
    status: str = "started"