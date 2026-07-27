from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime, timezone
from app.models.order import Order, OrderItem
from app.models.menu_item import MenuItem
from app.models.user import User
from app.schemas.order import OrderCreate, OrderStatusUpdate
from app.dependencies.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("/", status_code=201)
async def place_order(data: OrderCreate, current_user: dict = Depends(get_current_user)):
    if not data.cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    user = await User.get(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    order_items = []
    total_amount = 0.0
    for cart_item in data.cart_items:
        menu_item = await MenuItem.get(cart_item.menu_item_id)
        if not menu_item or not menu_item.is_available:
            raise HTTPException(status_code=400, detail=f"Item unavailable: {cart_item.menu_item_id}")
        order_items.append(OrderItem(
            menu_item_id=str(menu_item.id),
            name=menu_item.name,
            price=menu_item.price,
            quantity=cart_item.quantity,
        ))
        total_amount += menu_item.price * cart_item.quantity

    order = Order(user=user, items=order_items, total_amount=total_amount)
    await order.insert()
    return order

@router.get("/my")
async def my_orders(current_user: dict = Depends(get_current_user)):
    return await Order.find(Order.user.id == current_user["id"]).sort("-created_at").to_list()

@router.get("/")
async def all_orders(status: Optional[str] = Query(None), admin: dict = Depends(require_admin)):
    query = Order.find(Order.status == status) if status else Order.find_all()
    return await query.sort("-created_at").to_list()

@router.get("/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await Order.get(order_id, fetch_links=True)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    user_id = str(order.user.id) if hasattr(order.user, "id") else str(order.user)
    if current_user["role"] != "admin" and user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return order

@router.patch("/{order_id}/status")
async def update_status(order_id: str, data: OrderStatusUpdate, admin: dict = Depends(require_admin)):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.status
    order.updated_at = datetime.now(timezone.utc)
    await order.save()
    return order

@router.patch("/{order_id}/cancel")
async def cancel_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    user_id = str(order.user.id) if hasattr(order.user, "id") else str(order.user)
    if user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    if order.status != "placed":
        raise HTTPException(status_code=400, detail="Order can no longer be cancelled")
    order.status = "cancelled"
    order.updated_at = datetime.now(timezone.utc)
    await order.save()
    return order
