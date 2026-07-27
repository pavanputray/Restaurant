import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
from app.models.user import User
from app.models.menu_item import MenuItem
from app.models.order import Order
from app.utils.security import hash_password

SAMPLE_MENU = [
    {
        "name": "Masala Dosa",
        "description": "Crispy rice crepe filled with spiced potato masala, served with coconut chutney & sambar.",
        "price": 60.0,
        "category": "Breakfast",
        "is_veg": True,
        "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500",
        "is_available": True,
    },
    {
        "name": "Idli Sambar (2 pcs)",
        "description": "Steamed fluffy rice cakes served with hot lentil sambar and tangy coconut chutney.",
        "price": 40.0,
        "category": "Breakfast",
        "is_veg": True,
        "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500",
        "is_available": True,
    },
    {
        "name": "Paneer Butter Masala Thali",
        "description": "Rich cottage cheese gravy, 3 butter rotis, steamed basmati rice, dal fry, and salad.",
        "price": 130.0,
        "category": "Lunch",
        "is_veg": True,
        "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500",
        "is_available": True,
    },
    {
        "name": "Chicken Biryani",
        "description": "Fragrant long-grain basmati rice cooked with marinated chicken and aromatic spices.",
        "price": 160.0,
        "category": "Lunch",
        "is_veg": False,
        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
        "is_available": True,
    },
    {
        "name": "Veg Cheese Grilled Sandwich",
        "description": "Triple-decker toasted sandwich stuffed with fresh veggies, green chutney, and melted cheese.",
        "price": 70.0,
        "category": "Snacks",
        "is_veg": True,
        "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500",
        "is_available": True,
    },
    {
        "name": "Samosa (2 pcs)",
        "description": "Crispy golden fried pastry filled with spiced potato and peas mixture.",
        "price": 30.0,
        "category": "Snacks",
        "is_veg": True,
        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
        "is_available": True,
    },
    {
        "name": "Cold Coffee with Ice Cream",
        "description": "Thick blended espresso cold coffee topped with a scoop of vanilla ice cream.",
        "price": 65.0,
        "category": "Beverages",
        "is_veg": True,
        "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500",
        "is_available": True,
    },
    {
        "name": "Masala Chai",
        "description": "Hot brewed Indian tea spiced with ginger, cardamom, and cinnamon.",
        "price": 20.0,
        "category": "Beverages",
        "is_veg": True,
        "image_url": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=500",
        "is_available": True,
    },
]

async def seed():
    print("Connecting to MongoDB for seeding...")
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client.get_default_database()
    await init_beanie(database=db, document_models=[User, MenuItem, Order])

    # Check or create Admin user
    admin_email = "admin@canteen.hostel"
    admin = await User.find_one(User.email == admin_email)
    if not admin:
        admin = User(
            name="Canteen Manager",
            email=admin_email,
            password_hash=hash_password("AdminPass123!"),
            role="admin",
            hostel_room="Admin Office",
        )
        await admin.insert()
        print(f"Created admin user: {admin_email} / AdminPass123!")
    else:
        print(f"Admin user already exists: {admin_email}")

    # Seed Menu Items
    inserted_count = 0
    for item_data in SAMPLE_MENU:
        existing = await MenuItem.find_one(MenuItem.name == item_data["name"])
        if not existing:
            item = MenuItem(**item_data, created_by=admin)
            await item.insert()
            inserted_count += 1

    print(f"Seeding completed! Inserted {inserted_count} new menu items.")

if __name__ == "__main__":
    asyncio.run(seed())
