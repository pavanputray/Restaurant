from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
from app.models.user import User
from app.models.menu_item import MenuItem
from app.models.order import Order
import logging

logger = logging.getLogger(__name__)

async def init_db(client: AsyncIOMotorClient = None):
    if client is None:
        logger.info("Connecting to MongoDB...")
        client = AsyncIOMotorClient(
            settings.mongo_uri,
            serverSelectionTimeoutMS=10000,
        )
    
    try:
        db = client.get_default_database()
    except Exception:
        db = client.get_database("hostel-canteen")

    logger.info(f"Using database: {db.name}")

    await init_beanie(
        database=db,
        document_models=[User, MenuItem, Order],
    )
    logger.info("Beanie ODM initialized successfully.")
