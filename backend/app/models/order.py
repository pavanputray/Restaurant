from beanie import Document, Link
from pydantic import BaseModel, Field
from typing import Literal, List
from datetime import datetime, timezone
from app.models.user import User

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class OrderItem(BaseModel):
    menu_item_id: str
    name: str
    price: float
    quantity: int

class Order(Document):
    user: Link[User]
    items: List[OrderItem]
    total_amount: float
    status: Literal["placed", "preparing", "ready", "completed", "cancelled"] = "placed"
    payment_status: Literal["pending", "paid"] = "pending"
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    class Settings:
        name = "orders"
