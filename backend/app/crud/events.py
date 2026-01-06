from datetime import datetime
from typing import List, Optional
import uuid

from app.schemas.event import EventCreate, EventRead


def get_events_collection():
    from app.db.mongo import db
    if db is None:
        raise RuntimeError("MongoDB not initialized. Did you call connect_to_mongo()?")
    return db["events"]


def serialize_event(doc) -> EventRead:
    return EventRead(
        id=str(doc["_id"]), 
        user_id=doc["user_id"],
        session_id=doc.get("session_id"),
        timestamp=doc["timestamp"],
        app_name=doc.get("app_name"),
        window_title=doc.get("window_title"),
        activity_vector=doc.get("activity_vector", {}) or {},
    )


# CREATE
async def create_event(event: EventCreate) -> str:
    """
    이벤트 1개 생성 후 event_id(str) 반환
    - _id를 uuid 문자열로 통일
    """
    events = get_events_collection()

    event_id = str(uuid.uuid4())
    new_doc = {
        "_id": event_id,  
        "user_id": event.user_id,
        "session_id": event.session_id,
        "timestamp": event.timestamp,
        "app_name": event.app_name,
        "window_title": event.window_title,
        "activity_vector": event.activity_vector or {},
    }

    await events.insert_one(new_doc)
    return event_id


# CREATE - 서버에서 user_id 주입하는 버전
async def create_event_for_user(user_id: str, event: EventCreate) -> str:
    """
    요청 스키마의 user_id는 무시하고 서버 user_id로 강제 주입
    - _id를 uuid 문자열로 통일
    """
    events = get_events_collection()

    event_id = str(uuid.uuid4())
    new_doc = {
        "_id": event_id,  
        "user_id": user_id,
        "session_id": event.session_id,
        "timestamp": event.timestamp,
        "app_name": event.app_name,
        "window_title": event.window_title,
        "activity_vector": event.activity_vector or {},
    }

    await events.insert_one(new_doc)
    return event_id


# READ ONE
async def get_event(event_id: str) -> Optional[EventRead]:
    events = get_events_collection()

    doc = await events.find_one({"_id": event_id})
    if not doc:
        return None
    return serialize_event(doc)


# READ MANY
async def get_events(
    user_id: str,
    session_id: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 100,
) -> List[EventRead]:
    events = get_events_collection()

    query = {"user_id": user_id}

    if session_id is not None:
        query["session_id"] = session_id

    if start_time is not None or end_time is not None:
        ts = {}
        if start_time is not None:
            ts["$gte"] = start_time
        if end_time is not None:
            ts["$lte"] = end_time
        if ts:
            query["timestamp"] = ts

    safe_limit = max(1, min(limit, 1000))

    cursor = events.find(query).sort("timestamp", -1).limit(safe_limit)
    docs = await cursor.to_list(length=safe_limit)
    return [serialize_event(d) for d in docs]
