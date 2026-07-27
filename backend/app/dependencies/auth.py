from fastapi import Request, HTTPException, Depends
import jwt
from app.utils.security import decode_access_token

def get_current_user(request: Request) -> dict:
    token = request.cookies.get("token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_access_token(token)
        return {"id": payload["sub"], "role": payload["role"]}
    except (jwt.PyJWTError, Exception):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
