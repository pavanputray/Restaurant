import pytest
from app.models.menu_item import MenuItem

@pytest.mark.asyncio
async def test_list_available_menu(async_client, test_admin):
    item1 = MenuItem(name="Puri Bhaji", price=50.0, category="Breakfast", is_available=True)
    item2 = MenuItem(name="Out of Stock Tea", price=15.0, category="Beverages", is_available=False)
    await item1.insert()
    await item2.insert()

    response = await async_client.get("/api/menu/")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert items[0]["name"] == "Puri Bhaji"

@pytest.mark.asyncio
async def test_admin_create_menu_item(async_client, admin_token):
    async_client.cookies.set("token", admin_token)
    payload = {
        "name": "Veg Thali",
        "description": "Full meal",
        "price": 120.0,
        "category": "Lunch",
        "is_veg": True,
    }
    response = await async_client.post("/api/menu/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Veg Thali"

@pytest.mark.asyncio
async def test_customer_cannot_create_menu_item(async_client, user_token):
    async_client.cookies.set("token", user_token)
    payload = {
        "name": "Illegal Item",
        "price": 99.0,
    }
    response = await async_client.post("/api/menu/", json=payload)
    assert response.status_code == 403
