from fastapi import APIRouter, HTTPException, Response, Depends
from app.models.user import User
from app.schemas.auth import SignupRequest, LoginRequest
from app.utils.security import hash_password, verify_password, create_access_token
from app.dependencies.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

def set_auth_cookie(response: Response, token: str):
    is_prod = settings.environment == "production"
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        secure=is_prod,
        samesite="none" if is_prod else "lax",
        max_age=7 * 24 * 60 * 60,
    )

@router.post("/signup", status_code=201)
async def signup(data: SignupRequest, response: Response):
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        hostel_room=data.hostel_room,
    )
    await user.insert()

    token = create_access_token(str(user.id), user.role)
    set_auth_cookie(response, token)
    return {"id": str(user.id), "name": user.name, "email": user.email, "role": user.role, "token": token}

@router.post("/login")
async def login(data: LoginRequest, response: Response):
    user = await User.find_one(User.email == data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(str(user.id), user.role)
    set_auth_cookie(response, token)
    return {"id": str(user.id), "name": user.name, "email": user.email, "role": user.role, "token": token}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("token")
    return {"message": "Logged out"}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await User.get(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": str(user.id), "name": user.name, "email": user.email, "role": user.role, "hostel_room": user.hostel_room}
