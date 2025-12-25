# Centra Plate Backend API Documentation

This documentation provides details on how to use the API endpoints for testing, including request bodies and example responses.

**Base URL**: `https://required-minetta-syntaxsoftwarehouse-63c67cf1.koyeb.app`

---

## **1. Authentication**

### **1.1 Register User**
Registers a new user. Optionally, you can assign a license plate during registration.

*   **URL**: `/api/auth/register`
*   **Method**: `POST`
*   **Auth Required**: No

**Request Body (JSON):**

```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "plateNumber": "ABC-123" 
}
```
*   `plateNumber` is **optional**.

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email with the OTP sent.",
  "data": {
    "userId": 15,
    "email": "john.doe@example.com",
    "plate": "ABC-123"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "User already exists"
}
```

---

### **1.2 Verify OTP**
Verifies the user's email address using the OTP sent during registration.

*   **URL**: `/api/auth/verify-otp`
*   **Method**: `POST`
*   **Auth Required**: No

**Request Body (JSON):**

```json
{
  "email": "john.doe@example.com",
  "otp": "1234"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": 15,
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "isVerified": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

---

### **1.3 Login**
Authenticates a user and returns a JWT token.

*   **URL**: `/api/auth/login`
*   **Method**: `POST`
*   **Auth Required**: No

**Request Body (JSON):**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 15,
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

**Error Response (403 Forbidden - Not Verified):**

```json
{
  "success": false,
  "message": "Please verify your email first."
}
```

---

### **1.4 Get All Users**
Retrieves a list of all registered users.

*   **URL**: `/api/auth/all-users`
*   **Method**: `GET`
*   **Auth Required**: **Yes** (Bearer Token)
*   **Headers**: `Authorization: Bearer <your_jwt_token>`

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "full_name": "Admin User",
        "email": "admin@centra.com",
        "role": "admin",
        "is_verified": 1
      },
      {
        "id": 15,
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "role": "user",
        "is_verified": 1
      }
    ]
  }
}
```

---

## **2. License Plates**

### **2.1 Assign Plate**
Assigns a license plate to the authenticated user.

*   **URL**: `/api/plates/assign`
*   **Method**: `POST`
*   **Auth Required**: **Yes** (Bearer Token)
*   **Headers**: `Authorization: Bearer <your_jwt_token>`

**Request Body (JSON):**

```json
{
  "plateNumber": "XYZ-999"
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "License plate assigned successfully",
  "data": {
    "plate": {
      "id": 5,
      "user_id": 15,
      "plate_number": "XYZ-999",
      "created_at": "2024-12-25T10:00:00.000Z"
    }
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "User already has a license plate assigned"
}
```

---

### **2.2 Get My Plate**
Retrieves the license plate assigned to the currently logged-in user.

*   **URL**: `/api/plates/my-plate`
*   **Method**: `GET`
*   **Auth Required**: **Yes** (Bearer Token)
*   **Headers**: `Authorization: Bearer <your_jwt_token>`

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "User plate retrieved",
  "data": {
    "plate": {
      "id": 5,
      "user_id": 15,
      "plate_number": "XYZ-999",
      "created_at": "2024-12-25T10:00:00.000Z"
    }
  }
}
```

---

### **2.3 Search Plate**
Search for a license plate by its number to see if it exists.

*   **URL**: `/api/plates/search/:plateNumber`
*   **Method**: `GET`
*   **Auth Required**: **Yes** (Bearer Token)
*   **Headers**: `Authorization: Bearer <your_jwt_token>`
*   **Example URL**: `/api/plates/search/XYZ-999`

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "License plate found",
  "data": {
    "plate": {
      "id": 5,
      "user_id": 15,
      "plate_number": "XYZ-999"
    }
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "License plate not found"
}
```

---

### **2.4 Get All Plates**
Retrieves a list of all license plates.

*   **URL**: `/api/plates/all`
*   **Method**: `GET`
*   **Auth Required**: No (Public)

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "All plates retrieved",
  "data": {
    "plates": [
      {
        "id": 1,
        "user_id": 10,
        "plate_number": "ADMIN-1"
      },
      {
        "id": 5,
        "user_id": 15,
        "plate_number": "XYZ-999"
      }
    ]
  }
}
```
