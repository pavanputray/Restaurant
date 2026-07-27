import pytest
from app.models.menu_item import MenuItem
from app.models.order import Order

@pytest.mark.asyncio
async def test_place_order_success(async_client, user_token):
    item = MenuItem(name="Coffee", price=25.0, is_available=True)
    await item.insert()

    async_client.cookies.set("token", user_token)
    payload = {
        "cart_items": [
            {"menu_item_id": str(item.id), "quantity": 2}
        ]
    }
    response = await async_client.post("/api/orders/", json=payload)
    assert response.status_code == 201
    order = response.json()
    assert order["total_amount"] == 50.0
    assert order["status"] == "placed"

@pytest.mark.asyncio
async def test_admin_update_order_status(async_client, user_token, admin_token):
    item = MenuItem(name="Coffee", price=25.0, is_available=True)
    await item.insert()

    # Place order as user
    async_client.cookies.set("token", user_token)
    payload = {"cart_items": [{"menu_item_id": str(item.id), "quantity": 1}]}
    order_res = await async_client.post("/api/orders/", json=payload)
    order_id = order_res.json()["_id"]

    # Update status as admin
    async_client.cookies.set("token", admin_token)
    status_payload = {"status": "preparing"}
    response = await async_client.patch(f"/api/orders/{order_id}/status", json=status_payload)
    assert response.status_code == 200
    assert response.json()["status"] == "preparing"
