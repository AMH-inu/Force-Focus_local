# backend/app/api/endpoints/user/me.py

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user_id
from app.schemas.user import (
    UserRead,
    SettingsPatch,
    SuccessMessage,
    FCMTokenAdd,
    FCMTokenDelete,
    BlockedAppAdd,
    BlockedAppDelete,
)
from app.crud import users as users_crud
from app.crud.users import (
    update_settings,
    add_fcm_token,
    remove_fcm_token,
    add_blocked_app,
    remove_blocked_app,
)

router = APIRouter(prefix="/users", tags=["Users"])


def _to_user_read(user) -> UserRead:
    """
    UserInDB -> UserRead 변환 시 id(ObjectId)를 str로 강제 변환.
    """
    data = user.model_dump(by_alias=False)
    data["id"] = str(user.id)
    return UserRead(**data)


@router.get("/me", response_model=UserRead)
async def read_my_profile(
    user_id: str = Depends(get_current_user_id),
):
    user = await users_crud.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return _to_user_read(user)


@router.patch("/me/settings", response_model=UserRead)
async def update_my_settings(
    payload: SettingsPatch,
    user_id: str = Depends(get_current_user_id),
):
    user = await update_settings(user_id=user_id, settings=payload.settings)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update settings")

    return _to_user_read(user)


@router.post("/me/fcm-tokens", response_model=UserRead)
async def add_my_fcm_token(
    payload: FCMTokenAdd,
    user_id: str = Depends(get_current_user_id),
):
    user = await add_fcm_token(user_id=user_id, token=payload.token)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to add FCM token")

    return _to_user_read(user)


@router.delete("/me/fcm-tokens", response_model=SuccessMessage)
async def delete_my_fcm_token(
    payload: FCMTokenDelete,
    user_id: str = Depends(get_current_user_id),
):
    token = payload.token or getattr(payload, "fcm_token", None)

    user = await remove_fcm_token(user_id=user_id, token=token)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to remove FCM token")

    return SuccessMessage(message="FCM token removed")


@router.post("/me/blocked-apps", response_model=UserRead)
async def add_my_blocked_app(
    payload: BlockedAppAdd,
    user_id: str = Depends(get_current_user_id),
):
    user = await add_blocked_app(user_id=user_id, app_name=payload.app_name)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to add blocked app")

    return _to_user_read(user)


@router.delete("/me/blocked-apps", response_model=UserRead)
async def delete_my_blocked_app(
    payload: BlockedAppDelete,
    user_id: str = Depends(get_current_user_id),
):
    user = await remove_blocked_app(user_id=user_id, app_name=payload.app_name)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to remove blocked app")

    return _to_user_read(user)
