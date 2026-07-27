from beanie import Document
from pydantic import EmailStr, Field
from typing import Literal, Optional
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Document):
    name: str
    email: EmailStr
    password_hash: str
    role: Literal["customer", "admin"] = "customer"
    hostel_room: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)

    class Settings:
        name = "users"
