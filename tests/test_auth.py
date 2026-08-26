import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import datetime
import jwt

from app.main import app
from app.database import Base, settings
from app.dependencies import get_db
from app.auth import create_access_token

# Setup clean in-memory database for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override database dependency in FastAPI app
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    """Fixture to recreate database tables before each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# --- 1. REGISTRATION TESTS ---

def test_registration_success():
    payload = {
        "name": "Ramesh Kumar",
        "phone": "9876543210",
        "language": "Hindi",
        "village": "Rampur",
        "district": "Patna",
        "state": "Bihar",
        "latitude": 25.5941,
        "longitude": 85.1376,
        "main_crop": "Rice",
        "field_size": 2.5,
        "password": "securepassword123"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["phone"] == payload["phone"]
    assert data["language"] == payload["language"]
    assert data["village"] == payload["village"]
    assert data["district"] == payload["district"]
    assert data["state"] == payload["state"]
    assert data["latitude"] == payload["latitude"]
    assert data["longitude"] == payload["longitude"]
    assert data["main_crop"] == payload["main_crop"]
    assert data["field_size"] == payload["field_size"]
    assert "id" in data
    assert "created_at" in data
    # Security checks: make sure credentials are NOT returned
    assert "password" not in data
    assert "password_hash" not in data

def test_registration_duplicate_phone():
    payload = {
        "name": "Ramesh Kumar",
        "phone": "9876543210",
        "language": "Hindi",
        "village": "Rampur",
        "district": "Patna",
        "state": "Bihar",
        "latitude": 25.5941,
        "longitude": 85.1376,
        "main_crop": "Rice",
        "field_size": 2.5,
        "password": "securepassword123"
    }
    # Register once
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    
    # Register again with same phone
    payload["name"] = "Ramesh Prasad" # Different name, same phone
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Phone number already registered"

def test_registration_missing_required_fields():
    payload = {
        "phone": "9876543210",
        "password": "securepassword123"
    }
    response = client.post("/auth/register", json=payload)
    # Missing multiple required fields should result in 422 Unprocessable Entity
    assert response.status_code == 422

def test_registration_invalid_phone_string():
    payload = {
        "name": "Ramesh Kumar",
        "phone": "string",
        "language": "Hindi",
        "village": "Rampur",
        "district": "Patna",
        "state": "Bihar",
        "latitude": 25.5941,
        "longitude": 85.1376,
        "main_crop": "Rice",
        "field_size": 2.5,
        "password": "securepassword123"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 422

def test_registration_invalid_phone_too_short():
    payload = {
        "name": "Ramesh Kumar",
        "phone": "123",
        "language": "Hindi",
        "village": "Rampur",
        "district": "Patna",
        "state": "Bihar",
        "latitude": 25.5941,
        "longitude": 85.1376,
        "main_crop": "Rice",
        "field_size": 2.5,
        "password": "securepassword123"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 422

# --- 2. LOGIN TESTS ---

def test_login_success():
    # Register a user first
    payload = {
        "name": "Ramesh Kumar",
        "phone": "9876543210",
        "language": "Hindi",
        "village": "Rampur",
        "district": "Patna",
        "state": "Bihar",
        "latitude": 25.5941,
        "longitude": 85.1376,
        "main_crop": "Rice",
        "field_size": 2.5,
        "password": "securepassword123"
    }
    client.post("/auth/register", json=payload)
    
    # Attempt login
    login_payload = {
        "phone": "9876543210",
        "password": "securepassword123"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password():
    payload = {
        "name": "Ramesh Kumar",
        "phone": "9876543210",
        "language": "Hindi",
        "village": "Rampur",
        "district": "Patna",
        "state": "Bihar",
        "latitude": 25.5941,
        "longitude": 85.1376,
        "main_crop": "Rice",
        "field_size": 2.5,
        "password": "securepassword123"
    }
    client.post("/auth/register", json=payload)
    
    # Wrong password
    login_payload = {
        "phone": "9876543210",
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid mobile number or password"

def test_login_non_existing_mobile():
    login_payload = {
        "phone": "1111111111",
        "password": "securepassword123"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid mobile number or password"

# --- 3. JWT & PROFILE TESTS ---

def test_profile_success():
    # Register user
    payload = {
        "name": "Ramesh Kumar",
        "phone": "9876543210",
        "language": "Hindi",
        "village": "Rampur",
        "district": "Patna",
        "state": "Bihar",
        "latitude": 25.5941,
        "longitude": 85.1376,
        "main_crop": "Rice",
        "field_size": 2.5,
        "password": "securepassword123"
    }
    client.post("/auth/register", json=payload)
    
    # Login to get token
    login_payload = {
        "phone": "9876543210",
        "password": "securepassword123"
    }
    login_resp = client.post("/auth/login", json=login_payload)
    token = login_resp.json()["access_token"]
    
    # Fetch profile
    headers = {"Authorization": f"Bearer {token}"}
    profile_resp = client.get("/auth/profile", headers=headers)
    assert profile_resp.status_code == 200
    
    profile_data = profile_resp.json()
    assert profile_data["phone"] == payload["phone"]
    assert profile_data["name"] == payload["name"]

def test_profile_missing_token():
    response = client.get("/auth/profile")
    # OAuth2 scheme redirects / throws 401 if missing Authorization header
    assert response.status_code == 401

def test_profile_invalid_token():
    headers = {"Authorization": "Bearer completely_invalid_jwt_token_string"}
    response = client.get("/auth/profile", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"

def test_profile_expired_token():
    # Generate an expired token manually
    expired_payload = {
        "sub": "1",
        "exp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=10)
    }
    expired_token = jwt.encode(expired_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    # Attempt profile request with expired token
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/auth/profile", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Token has expired"
