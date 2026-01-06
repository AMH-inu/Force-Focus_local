# backend/app/crud/users.py

from datetime import datetime, timezone
from typing import Optional, Dict, Any, Union

from bson import ObjectId
from bson.errors import InvalidId

from app.db.mongo import get_db
from app.models.user import UserInDB


def get_users_collection():
    """
    Motor DB 핸들에서 users 컬렉션을 가져옵니다.
    connect_to_mongo() 이후에 db가 세팅되어 있어야 합니다.
    """
    return get_db()["users"]


def _safe_object_id(user_id: Union[str, ObjectId]) -> Optional[ObjectId]:
    """
    str/ObjectId 입력을 안전하게 ObjectId로 변환합니다.
    """
    if isinstance(user_id, ObjectId):
        return user_id

    try:
        return ObjectId(user_id)
    except (InvalidId, TypeError):
        return None


def _id_filter(user_id: Union[str, ObjectId]) -> Dict[str, Any]:
    """
    users 컬렉션의 _id 타입이 ObjectId / string 혼재된 상황을 모두 커버하는 필터.
    - ObjectId로 변환 가능하면: ObjectId / string 둘 다 매칭
    - 변환 불가하면: string 매칭
    """
    oid = _safe_object_id(user_id)

    # user_id가 문자열이고 ObjectId 변환도 가능하면(24 hex), 둘 다 조회/업데이트
    if isinstance(user_id, str) and oid is not None:
        return {"$or": [{"_id": oid}, {"_id": user_id}]}

    # 이미 ObjectId면 그대로
    if oid is not None:
        return {"_id": oid}

    # 나머지는 문자열 _id로 취급
    return {"_id": user_id}


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ---------- READ ----------

async def get_user_by_id(user_id: Union[str, ObjectId]) -> Optional[UserInDB]:
    user = await get_users_collection().find_one(_id_filter(user_id))
    return UserInDB(**user) if user else None


async def get_user_by_google_id(google_id: str) -> Optional[UserInDB]:
    user = await get_users_collection().find_one({"google_id": google_id})
    return UserInDB(**user) if user else None


# ---------- CREATE ----------

async def create_user(
    *,
    email: str,
    google_id: str,
    user_settings: Optional[Dict[str, Any]] = None
) -> UserInDB:
    now = _now()

    user_data = {
        "email": email,
        "google_id": google_id,
        "created_at": now,
        "last_login_at": now,
        "settings": user_settings or {},
        "fcm_tokens": [],
        "blocked_apps": [],
    }

    result = await get_users_collection().insert_one(user_data)
    user_data["_id"] = result.inserted_id
    return UserInDB(**user_data)


# ---------- UPDATE ----------

async def update_last_login(user_id: Union[str, ObjectId]) -> Optional[UserInDB]:
    result = await get_users_collection().update_one(
        _id_filter(user_id),
        {"$set": {"last_login_at": _now()}}
    )
    if result.matched_count == 0:
        return None

    return await get_user_by_id(user_id)


async def update_settings(user_id: Union[str, ObjectId], settings: Dict[str, Any]) -> Optional[UserInDB]:
    if not settings:
        return await get_user_by_id(user_id)

    result = await get_users_collection().update_one(
        _id_filter(user_id),
        {"$set": {f"settings.{k}": v for k, v in settings.items()}},
    )
    if result.matched_count == 0:
        return None

    return await get_user_by_id(user_id)


async def add_fcm_token(user_id: Union[str, ObjectId], token: str) -> Optional[UserInDB]:
    result = await get_users_collection().update_one(
        _id_filter(user_id),
        {"$addToSet": {"fcm_tokens": token}}
    )
    if result.matched_count == 0:
        return None

    return await get_user_by_id(user_id)


async def remove_fcm_token(user_id: Union[str, ObjectId], token: Optional[str] = None) -> Optional[UserInDB]:
    update = {"$pull": {"fcm_tokens": token}} if token else {"$set": {"fcm_tokens": []}}
    result = await get_users_collection().update_one(_id_filter(user_id), update)

    if result.matched_count == 0:
        return None

    return await get_user_by_id(user_id)


async def add_blocked_app(user_id: Union[str, ObjectId], app_name: str) -> Optional[UserInDB]:
    result = await get_users_collection().update_one(
        _id_filter(user_id),
        {"$addToSet": {"blocked_apps": app_name}}
    )
    if result.matched_count == 0:
        return None

    return await get_user_by_id(user_id)


async def remove_blocked_app(user_id: Union[str, ObjectId], app_name: str) -> Optional[UserInDB]:
    result = await get_users_collection().update_one(
        _id_filter(user_id),
        {"$pull": {"blocked_apps": app_name}}
    )
    if result.matched_count == 0:
        return None

    return await get_user_by_id(user_id)
