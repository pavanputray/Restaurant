import pytest

@pytest.mark.asyncio
async def test_signup_success(async_client):
    payload = {
        "name": "New Student",
        "email": "newstudent@hostel.edu",
        "password": "SecretPassword123",
        "hostel_room": "A-101",
    }
    response = await async_client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newstudent@hostel.edu"
    assert data["role"] == "customer"

@pytest.mark.asyncio
async def test_signup_duplicate_email(async_client, test_user):
    payload = {
        "name": "Another Student",
        "email": test_user.email,
        "password": "Password123",
    }
    response = await async_client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

@pytest.mark.asyncio
async def test_login_success(async_client, test_user):
    payload = {
        "email": test_user.email,
        "password": "password123",
    }
    response = await async_client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email

@pytest.mark.asyncio
async def test_login_invalid_password(async_client, test_user):
    payload = {
        "email": test_user.email,
        "password": "wrongpassword",
    }
    response = await async_client.post("/api/auth/login", json=payload)
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me(async_client, user_token):
    async_client.cookies.set("token", user_token)
    response = await async_client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "student@hostel.edu"
