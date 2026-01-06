# backend/app/crud/sessions.py

from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException

from app.db.mongo import get_db
from app.schemas.session import SessionCreate, SessionUpdate, SessionRead


def get_sessions_collection():
    """
    Motor DB 핸들에서 sessions 컬렉션을 가져옵니다.
    """
    return get_db()["sessions"]


def serialize_session(session) -> SessionRead:
    """
    Mongo document(dict) -> SessionRead
    """
    return SessionRead(
        id=str(session["_id"]),
        user_id=session["user_id"],
        task_id=session.get("task_id"),
        profile_id=session.get("profile_id"),
        start_time=session["start_time"],
        end_time=session.get("end_time"),
        duration=session.get("duration"),
        status=session.get("status", "active"),
        goal_duration=session.get("goal_duration"),
        interruption_count=session.get("interruption_count", 0),
    )


def _safe_object_id(session_id: str) -> ObjectId:
    try:
        return ObjectId(session_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid session_id")


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _compute_duration_seconds(start_time: datetime, end_time: datetime) -> float:
    """
    duration을 초 단위로 계산. 음수 방지.
    """
    sec = (end_time - start_time).total_seconds()
    if sec < 0:
        raise HTTPException(status_code=400, detail="end_time must be after start_time")
    return float(sec)


# CREATE (START)
async def start_session(user_id: str, data: SessionCreate) -> SessionRead:
    col = get_sessions_collection()

    # SessionCreate에서 start_time은 필수지만, 혹시라도 None이면 서버 시간으로 보정
    start_time = data.start_time or _utcnow()

    doc = {
        "user_id": user_id,
        "task_id": data.task_id,
        "profile_id": data.profile_id,
        "start_time": start_time,
        "end_time": None,
        "duration": None,
        "status": "active",
        "goal_duration": data.goal_duration,
        "interruption_count": 0,
    }

    result = await col.insert_one(doc)
    created = await col.find_one({"_id": result.inserted_id})
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create session")
    return serialize_session(created)


# READ ALL (user 기준)
async def get_sessions(
    user_id: str,
    status: Optional[str] = None,
    limit: int = 50
) -> List[SessionRead]:
    col = get_sessions_collection()

    query = {"user_id": user_id}
    if status:
        query["status"] = status

    cursor = col.find(query).sort("start_time", -1).limit(limit)
    sessions = await cursor.to_list(length=limit)
    return [serialize_session(s) for s in sessions]


# READ ONE
async def get_session(session_id: str) -> Optional[SessionRead]:
    col = get_sessions_collection()
    oid = _safe_object_id(session_id)

    session = await col.find_one({"_id": oid})
    if not session:
        return None
    return serialize_session(session)


# READ CURRENT (active 세션 1개)
async def get_current_session(user_id: str) -> Optional[SessionRead]:
    col = get_sessions_collection()

    session = await col.find_one(
        {"user_id": user_id, "status": "active"},
        sort=[("start_time", -1)],
    )
    if not session:
        return None
    return serialize_session(session)


# UPDATE (END 포함)
async def update_session(user_id: str, session_id: str, data: SessionUpdate) -> SessionRead:
    col = get_sessions_collection()
    oid = _safe_object_id(session_id)

    existing = await col.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Session not found")

    # 다른 유저 세션 수정 방지
    if existing.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    update_doc = {}

    if data.end_time is not None:
        update_doc["end_time"] = data.end_time
        update_doc["duration"] = _compute_duration_seconds(existing["start_time"], data.end_time)

    if data.status is not None:
        update_doc["status"] = data.status

    if data.goal_duration is not None:
        update_doc["goal_duration"] = data.goal_duration

    if data.interruption_count is not None:
        if data.interruption_count < 0:
            raise HTTPException(status_code=400, detail="interruption_count must be >= 0")
        update_doc["interruption_count"] = data.interruption_count

    if not update_doc:
        return serialize_session(existing)

    await col.update_one({"_id": oid}, {"$set": update_doc})
    updated = await col.find_one({"_id": oid})
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update session")
    return serialize_session(updated)


# (선택) 세션 종료 helper
async def end_session(
    user_id: str,
    session_id: str,
    end_time: datetime,
    status: str = "completed",
) -> SessionRead:
    return await update_session(
        user_id,
        session_id,
        SessionUpdate(end_time=end_time, status=status),
    )
