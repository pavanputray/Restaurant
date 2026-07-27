from pydantic import BaseModel
from typing import List, Literal

class CartItem(BaseModel):
    menu_item_id: str
    quantity: int

class OrderCreate(BaseModel):
    cart_items: List[CartItem]

class OrderStatusUpdate(BaseModel):
    status: Literal["placed", "preparing", "ready", "completed", "cancelled"]
