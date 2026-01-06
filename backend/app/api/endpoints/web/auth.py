# backend/app/api/endpoints/web/auth.py

from datetime import datetime, timezone
import os
import uuid
from urllib.parse import urlencode, urlparse

from dotenv import load_dotenv
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from authlib.integrations.starlette_client import OAuth, OAuthError

from app.db import mongo
from app.models.user import UserInDB
from app.core.security import create_access_token, create_refresh_token



load_dotenv()

router = APIRouter(prefix="/api/v1/auth", tags=["Auth (Web)"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# 백엔드가 외부에서 접근 가능한 주소 (콜백 URL 구성용)
BACKEND_PUBLIC_URL = os.getenv("BACKEND_PUBLIC_URL", "http://127.0.0.1:8000")

# 웹 대시보드 주소(리다이렉트 allowlist 용도). 예: https://dashboard.forcefocus.com
WEB_DASHBOARD_PUBLIC_URL = os.getenv("WEB_DASHBOARD_PUBLIC_URL")  # 없으면 next 검증을 더 엄격하게 함


oauth = OAuth()
oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


def _validate_next(next_url: str | None) -> str | None:
    """
    Open redirect 방지용.
    - next가 '/path' 같은 상대경로면 WEB_DASHBOARD_PUBLIC_URL과 합쳐 사용
    - next가 절대 URL이면 WEB_DASHBOARD_PUBLIC_URL과 동일 origin일 때만 허용
    """
    if not next_url:
        return None

    next_url = next_url.strip()
    if not next_url:
        return None

    # 상대 경로 허용: "/dashboard" 형태
    if next_url.startswith("/"):
        if not WEB_DASHBOARD_PUBLIC_URL:
            return None
        return WEB_DASHBOARD_PUBLIC_URL.rstrip("/") + next_url

    # 절대 URL 허용: allowlist(동일 origin)만
    if not WEB_DASHBOARD_PUBLIC_URL:
        return None

    try:
        n = urlparse(next_url)
        w = urlparse(WEB_DASHBOARD_PUBLIC_URL)
        if (n.scheme, n.netloc) == (w.scheme, w.netloc):
            return next_url
    except Exception:
        return None

    return None


@router.get("/google/login")
async def google_login(request: Request, next: str | None = None):
    """
    웹 대시보드용 Google OAuth 로그인 시작.
    next:
      - 성공 후 리다이렉트할 웹 URL(또는 상대경로)
      - 토큰은 redirect URL의 fragment(#)로 전달
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth env is not configured")

    # callback URL에 next를 그대로 넘겨서(검증은 callback에서) 되돌려 받음
    callback_base = f"{BACKEND_PUBLIC_URL.rstrip('/')}/api/v1/auth/google/callback"
    redirect_uri = callback_base
    if next:
        redirect_uri = f"{callback_base}?{urlencode({'next': next})}"

    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", response_model=TokenResponse)
async def google_callback(request: Request, next: str | None = None):
    """
    Google OAuth 콜백:
    - userinfo(email) 획득
    - users 컬렉션에서 email로 조회/생성
    - 공용 security로 access/refresh 발급
    - next가 유효하면 웹으로 redirect (fragment에 토큰)
    - 아니면 JSON 응답
    """
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")

        email = user_info.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Google user info missing email")

        # google_id는 보통 userinfo의 "sub" (고유 식별자)
        google_id = user_info.get("sub")
        if not google_id:
            raise HTTPException(status_code=400, detail="Google user info missing sub (google_id)")

        if mongo.db is None:
            raise HTTPException(status_code=500, detail="Database connection failed")

        user = await mongo.db.users.find_one({"email": email})

        if user:
            # 토큰에는 str로 통일해서 넣기
            user_id_str = str(user["_id"])
            # update는 DB에 저장된 실제 타입(_id)을 그대로 사용
            await mongo.db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"last_login_at": datetime.now(timezone.utc)}},
            )
        else:
            # 신규 유저는 uuid로 _id를 만들지 말고 MongoDB(ObjectId) 생성에 맡김
            new_user = UserInDB(
                email=email,
                google_id=google_id,
                created_at=datetime.now(timezone.utc),
                last_login_at=datetime.now(timezone.utc),
                settings={},
                blocked_apps=[],
            )
            user_dict = (
                new_user.dict(by_alias=True)
                if hasattr(new_user, "dict")
                else new_user.model_dump(by_alias=True)
            )

            insert_result = await mongo.db.users.insert_one(user_dict)
            user_id_str = str(insert_result.inserted_id)

        access_token = create_access_token(user_id_str)
        refresh_token = create_refresh_token(user_id_str)

        safe_next = _validate_next(next)
        if safe_next:
            # 토큰은 query가 아니라 fragment(#)로 전달 (서버 로그/리퍼러 노출 감소)
            fragment = urlencode(
                {
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "token_type": "bearer",
                    "email": email,
                }
            )
            return RedirectResponse(url=f"{safe_next}#{fragment}", status_code=302)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    except OAuthError as e:
        raise HTTPException(status_code=400, detail=f"Google OAuth failed: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
