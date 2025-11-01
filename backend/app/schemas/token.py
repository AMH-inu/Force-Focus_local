# 파일 위치: backend/app/schemas/token.py# 파일 위치: backend/app/schemas/token.py
from pydantic import BaseModel

class Token(BaseModel):
    """
    [응답] POST /users/login 성공 시
    로그인 성공 후 서버가 클라이언트에게 발급하는 액세스 토큰의 데이터 구조입니다.
    """
    access_token: str
    token_type: str = "bearer"