import pytest
import pytest_asyncio
from mongomock_motor import AsyncMongoMockClient
from beanie import init_beanie
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.user import User
from app.models.menu_item import MenuItem
from app.models.order import Order
from app.utils.security import hash_password, create_access_token

@pytest_asyncio.fixture(autouse=True)
async def init_test_db():
    client = AsyncMongoMockClient()
    db = client.get_database("test_db")
    await init_beanie(database=db, document_models=[User, MenuItem, Order])
    yield
    # Clean up collections
    await User.delete_all()
    await MenuItem.delete_all()
    await Order.delete_all()

@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest_asyncio.fixture
async def test_user():
    user = User(
        name="Test Student",
        email="student@hostel.edu",
        password_hash=hash_password("password123"),
        role="customer",
        hostel_room="B-204",
    )
    await user.insert()
    return user

@pytest_asyncio.fixture
async def test_admin():
    admin = User(
        name="Test Admin",
        email="admin@hostel.edu",
        password_hash=hash_password("adminpass123"),
        role="admin",
        hostel_room="Admin Office",
    )
    await admin.insert()
    return admin

@pytest.fixture
def user_token(test_user):
    return create_access_token(str(test_user.id), test_user.role)

@pytest.fixture
def admin_token(test_admin):
    return create_access_token(str(test_admin.id), test_admin.role)
