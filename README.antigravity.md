# Crop Disease Detection & Farmer Assistance System - Authentication Backend

This is the standalone, complete, and production-ready **Authentication Module** for the *Crop Disease Detection & Farmer Assistance System*. It handles farmer registration, login, profile management, and provides a reusable JWT-based dependency to secure other team members' modules (like fields, crops, weather, disease-analysis, etc.).

---

## 🚀 Technologies

* **Python** (Backend language)
* **FastAPI** (High-performance web framework)
* **SQLite** (Stateless relational database file)
* **SQLAlchemy** (Object Relational Mapper)
* **JWT (JSON Web Tokens)** (Stateless authorization mechanism)
* **bcrypt** (Secure cryptographic password hashing)
* **Pydantic v2** (Data parsing and validation schemas)
* **Uvicorn** (ASGI server)

---

## 🛠️ Project Structure

The project has been organized with a clean, modular structure:

```text
crop_auth_backend/
│
├── app/
│   ├── __init__.py
│   ├── main.py            # API bootstrap, middleware, and table creation
│   ├── database.py        # Settings configuration and SQLAlchemy session setup
│   ├── models.py          # SQLite database schema (Farmer model)
│   ├── schemas.py         # Pydantic validation schemas and aliases
│   ├── auth.py            # Password hashing and token creation utilities
│   ├── dependencies.py    # Reusable authentication dependencies
│   │
│   └── routes/
│       ├── __init__.py
│       └── auth_routes.py # Auth controllers (register, login, profile, logout)
│
├── tests/
│   └── test_auth.py       # Comprehensive pytest suite (runs on in-memory SQLite)
│
├── .env.example           # Shared configuration template
├── .env                   # Local configuration (never commit to git)
├── .gitignore             # Standard git rules
├── requirements.txt       # Project dependencies list
└── README.md              # This file
```

---

## 📦 Installation & Setup

Follow these steps to run the authentication module on your Windows environment:

1. **Clone or navigate to the directory**:
   ```powershell
   cd crop_auth_backend
   ```

2. **Create a virtual environment**:
   ```powershell
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   * For **PowerShell**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * For **Command Prompt (CMD)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```

4. **Install dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

5. **Setup Environment Variables**:
   Create a `.env` file in the root folder (a template has already been created for you as `.env.example`):
   ```ini
   SECRET_KEY=dev_secret_key_for_testing_authentication_module
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DATABASE_URL=sqlite:///./database.db
   ```

---

## 🖥️ Running the Application

Start the development server using **Uvicorn** with hot-reload enabled:

```powershell
uvicorn app.main:app --reload
```

The application will start running on **`http://127.0.0.1:8000`**.
* Interactive API Documentation (Swagger UI) is available at: **`http://127.0.0.1:8000/docs`**
* ReDoc alternative documentation is available at: **`http://127.0.0.1:8000/redoc`**

---

## 🧪 Running Automated Tests

Run the test suite using `pytest` inside the virtual environment. The test suite overrides the database connection to run 100% in-memory:

```powershell
python -m pytest tests/test_auth.py -v
```

---

## 🔌 API Endpoints Reference

### 1. Register a Farmer
* **URL**: `/auth/register`
* **Method**: `POST`
* **Request Body**: (Pydantic model fields are alias-friendly and accept both snake_case or spaced formats)
  ```json
  {
    "name": "Ramesh Kumar",
    "mobile": "9876543210",
    "preferred_language": "Hindi",
    "village": "Rampur",
    "district": "Patna",
    "state": "Bihar",
    "latitude": 25.5941,
    "longitude": 85.1376,
    "main_crop": "Rice",
    "approximate_field_size": 2.5,
    "password": "securepassword123"
  }
  ```
* **Response (HTTP 201 Created)**:
  ```json
  {
    "id": 1,
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
    "created_at": "2026-08-24T22:15:00Z"
  }
  ```
  *(Note: Password and password hashes are never returned in the response payload).*

### 2. Login Farmer
* **URL**: `/auth/login`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "mobile": "9876543210",
    "password": "securepassword123"
  }
  ```
* **Response (HTTP 200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```
* **Error Response (HTTP 401 Unauthorized)**:
  ```json
  {
    "detail": "Invalid mobile number or password"
  }
  ```

### 3. Get Farmer Profile
* **URL**: `/auth/profile`
* **Method**: `GET`
* **Headers Required**:
  ```text
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Response (HTTP 200 OK)**:
  ```json
  {
    "id": 1,
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
    "created_at": "2026-08-24T22:15:00Z"
  }
  ```
* **Error Response (HTTP 401 Unauthorized)** (e.g. Expired/Invalid token):
  ```json
  {
    "detail": "Token has expired"
  }
  ```

### 4. Logout Farmer
* **URL**: `/auth/logout`
* **Method**: `POST`
* **Response (HTTP 200 OK)**:
  ```json
  {
    "message": "Successfully logged out. Please discard your JWT token client-side."
  }
  ```

#### Stateless Logout Explanation
JSON Web Tokens (JWT) are entirely stateless. The server does not store active sessions in a database. Therefore, the server cannot block or invalidate an issued token immediately without introducing a stateful cache (like Redis).
To log out, the client (frontend React/Vue/mobile app) simply needs to:
1. Delete the JWT token from storage (e.g. `localStorage.removeItem("token")` or clear cookies).
2. Redirect the user back to the login screen.
Calling `/auth/logout` is supported as an API-compliant endpoint returning a confirmation message to guide standard client-side flows.

---

## 🤝 How to Integrate with other APIs (For Team Members)

Your teammates developing the other modules (like `/fields`, `/crops`, `/disease-analysis`, `/weather`, etc.) can easily verify request authentication by importing the reusable `get_current_farmer` dependency.

### Flow diagram

```text
  [ Frontend App ]
         │
         ├── 1. Register: POST /auth/register  ──> (Hashes & saves to SQLite)
         ├── 2. Login: POST /auth/login        ──> (Returns JWT token)
         │
         └── 3. Request other APIs (Include: Authorization: Bearer <JWT>)
                     │
                     v
             [ Teammate's API Endpoint ]
                     │ (Depends on: get_current_farmer)
                     ├── Validates Signature & Expiration
                     └── Returns data only if valid
```

### Integration Example in Python Code:

Here is how a teammate can protect their routes using our dependency:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_farmer
from app.models import Farmer

router = APIRouter(prefix="/disease-analysis", tags=["Disease Analysis"])

@router.get("/my-analyses")
def get_analyses_for_farmer(
    # Injects the active Farmer object, enforcing token verification
    current_farmer: Farmer = Depends(get_current_farmer)
):
    # Retrieve data secured specifically for the logged-in farmer
    farmer_id = current_farmer.id
    return {
        "farmer_name": current_farmer.name,
        "analyses": [
            {"id": 101, "crop": current_farmer.main_crop, "status": "Infected - Late Blight Detected"}
        ]
    }
```

---

## 🛡️ Git Commands to Push to GitHub

When your project is ready to commit and push to your private/public GitHub repository, run the following commands:

```powershell
# 1. Initialize git
git init

# 2. Add all files (the .gitignore ensures venv/ and .env are NOT staged)
git add .

# 3. Create your first commit
git commit -m "Add authentication module"

# 4. Create the main branch
git branch -M main

# 5. Link to your GitHub Repository (replace with your URL)
git remote add origin <MY_GITHUB_REPOSITORY_URL>

# 6. Push code to main
git push -u origin main
```
