from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.config import settings
from app.routers import auth, menu, orders

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize MongoDB and Beanie ODM
    await init_db()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="Hostel Canteen API",
    description="Backend API for Hostel Canteen Ordering System",
    version="1.0.0",
    lifespan=lifespan,
)

origins = list(filter(None, set([
    settings.client_url,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
])))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(orders.router)

@app.get("/api/health")
async def health():
    return {"status": "ok"}
