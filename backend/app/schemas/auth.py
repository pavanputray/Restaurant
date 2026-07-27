from pydantic import BaseModel, EmailStr
from typing import Optional

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    hostel_room: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
