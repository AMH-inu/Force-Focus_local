# backend/app/api/endpoints/web/feedback.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional

from app.api.deps import get_current_user_id
from app.schemas.feedback import FeedbackCreate, FeedbackRead, FeedbackTypeEnum
from app.crud import feedback as feedback_crud

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("/", response_model=FeedbackRead, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    payload: FeedbackCreate,
    user_id: str = Depends(get_current_user_id),  # ✅ str
):
    return await feedback_crud.create_feedback(user_id, payload)


@router.get("/", response_model=List[FeedbackRead])
async def read_feedbacks(
    event_id: Optional[str] = Query(default=None),
    feedback_type: Optional[FeedbackTypeEnum] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    user_id: str = Depends(get_current_user_id),  # ✅ str
):
    return await feedback_crud.get_feedbacks(
        user_id,
        event_id=event_id,
        feedback_type=feedback_type,
        limit=limit,
    )


@router.get("/{feedback_id}", response_model=FeedbackRead)
async def read_feedback(
    feedback_id: str,
    user_id: str = Depends(get_current_user_id),  # ✅ str
):
    fb = await feedback_crud.get_feedback(feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if fb.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    return fb


@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(
    feedback_id: str,
    user_id: str = Depends(get_current_user_id),  # ✅ str
):
    fb = await feedback_crud.get_feedback(feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if fb.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    ok = await feedback_crud.delete_feedback(feedback_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Feedback not found")

    return None    return None
