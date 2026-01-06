@ -1,25 +1,118 @@
# main.py
# backend/app/main.py

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from app.api.endpoints.web import tasks, schedules
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.db.mongo import connect_to_mongo, close_mongo_connection

app = FastAPI(title="Force Focus Backend")
# -------------------------
# Routers (Web)
# -------------------------
from app.api.endpoints.web import (
    tasks,
    schedules,
    sessions,
    auth as web_auth,
    events as web_events,
    feedback,
)

@app.on_event("startup")
async def startup_db():
    await connect_to_mongo()
# -------------------------
# Routers (User)
# -------------------------
from app.api.endpoints.user import me

# -------------------------
# Routers (Desktop)
# -------------------------
from app.api.endpoints.desktop import auth as desktop_auth
from app.api.endpoints.desktop import events as desktop_events

load_dotenv()

# [설정] 환경 구분
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

# [설정] 로컬 개발용 HTTP 허용 (authlib)
if not IS_PRODUCTION:
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
    print(f"⚠️ Running in {ENVIRONMENT} mode. Insecure transport enabled.")

@app.on_event("shutdown")
async def shutdown_db():
# -------------------------
# Lifespan (DB lifecycle)
# -------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title="Force Focus Backend", lifespan=lifespan)

# -------------------------
# Middleware
# -------------------------
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:1420",
        "http://127.0.0.1:1420",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        # 웹 대시보드가 3000을 쓰면 필요할 수 있음(선택)
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session (OAuth state 저장용)
SESSION_SECRET = os.getenv("SESSION_SECRET_KEY") or os.getenv("JWT_SECRET_KEY", "default-insecure-secret-key")

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    https_only=IS_PRODUCTION,  # 프로덕션 HTTPS면 True
    same_site="lax",
    path="/",
    max_age=3600,
    domain=None,
)

# -------------------------
# Health check
# -------------------------
@app.get("/")
async def read_root():
    return {"message": "Backend is running!"}

# 나중에 API 라우터들을 여기에 include 합니다.
# from app.api.endpoints import users, sessions # 예시
# app.include_router(users.router, prefix="/users", tags=["users"])
# -------------------------
# API Routers
# -------------------------

# Web Auth (OAuth redirect/callback or web login)
# (웹 auth 라우터 파일 내부에 prefix가 이미 /api/v1/auth 일 수 있으니 prefix는 여기서 붙이지 않음)
app.include_router(web_auth.router)

# User
app.include_router(me.router)

# Web core features
app.include_router(tasks.router)
app.include_router(schedules.router)
app.include_router(sessions.router)
app.include_router(web_events.router)
app.include_router(feedback.router)

app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
# Desktop Agent APIs (팀원 방식 유지: main에서 prefix 부여)
app.include_router(desktop_auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(desktop_events.router, prefix="/api/v1/events", tags=["events"])