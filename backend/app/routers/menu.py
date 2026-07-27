from fastapi import APIRouter, HTTPException, Depends
from app.models.menu_item import MenuItem
from app.models.user import User
from app.schemas.menu import MenuItemCreate, MenuItemUpdate
from app.dependencies.auth import require_admin

router = APIRouter(prefix="/api/menu", tags=["menu"])

@router.get("/")
async def list_available():
    return await MenuItem.find(MenuItem.is_available == True).sort("+category", "+name").to_list()

@router.get("/all")
async def list_all(admin: dict = Depends(require_admin)):
    return await MenuItem.find_all().sort("+category", "+name").to_list()

@router.post("/", status_code=201)
async def create_item(data: MenuItemCreate, admin: dict = Depends(require_admin)):
    user = await User.get(admin["id"])
    item = MenuItem(**data.model_dump(), created_by=user)
    await item.insert()
    return item

@router.put("/{item_id}")
async def update_item(item_id: str, data: MenuItemUpdate, admin: dict = Depends(require_admin)):
    item = await MenuItem.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(item, key, value)
    await item.save()
    return item

@router.delete("/{item_id}")
async def delete_item(item_id: str, admin: dict = Depends(require_admin)):
    item = await MenuItem.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    await item.delete()
    return {"message": "Item deleted"}

@router.patch("/{item_id}/availability")
async def toggle_availability(item_id: str, admin: dict = Depends(require_admin)):
    item = await MenuItem.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.is_available = not item.is_available
    await item.save()
    return item
