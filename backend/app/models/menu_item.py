from beanie import Document, Link
from pydantic import Field
from typing import Optional
from datetime import datetime, timezone
from app.models.user import User

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class MenuItem(Document):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    is_veg: bool = True
    image_url: Optional[str] = None
    is_available: bool = True
    created_by: Optional[Link[User]] = None
    created_at: datetime = Field(default_factory=utc_now)

    class Settings:
        name = "menu_items"
