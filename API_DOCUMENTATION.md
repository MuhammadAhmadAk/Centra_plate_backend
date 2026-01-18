# Centra Plate API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

### 1. Register User
**Endpoint:** `POST /auth/register`
**Description:** Create a new user account. Warning: `Verified` starts as `false`.

**Request Body:**
```json
{
  "displayName": "Tariq Khan",
  "email": "tariq@example.com",
  "password": "MySecretPassword123",
  "countryIso": "PK",
  "countryName": "Pakistan",
  "language": "English",
  "userTypeId": 1
}
```
*Note: `userTypeId` (default 1) is optional.*

**Success Response (201 Created):**
```json
{
    "status": true,
    "message": "User registered successfully. Please verify your email.",
    "data": {
        "userId": 5,
        "email": "tariq@example.com"
    }
}
```

### 2. Verify OTP
**Endpoint:** `POST /auth/verify-otp`
**Description:** Verify email using the 6-digit code received.

**Request Body:**
```json
{
  "email": "tariq@example.com",
  "otp": "123478"
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Email verified successfully",
    "data": {
        "user": {
            "id": 5,
            "displayName": "Tariq Khan",
            "email": "tariq@example.com",
            "isVerified": true
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR..."
    }
}
```

### 3. Login
**Endpoint:** `POST /auth/login`
**Description:** Login to get JWT access token.

**Request Body:**
```json
{
  "email": "tariq@example.com",
  "password": "MySecretPassword123"
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 5,
            "displayName": "Tariq Khan",
            "email": "tariq@example.com",
            "role": "User",
            "countryName": "Pakistan"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR..."
    }
}
```

---

## Vehicles (Requires Login)

**Header for these requests:**
`Authorization`: `Bearer <Your_JWT_Token>`

### 4. Add Vehicle
**Endpoint:** `POST /vehicles/add`
**Description:** Register a new vehicle.

**Request Body:**
```json
{
  "licensePlate": "NYC-2025",
  "countryIso": "US",
  "vehicleType": "Car", 
  "makeId": 1,
  "modelId": 2
}
```

**Success Response (201 Created):**
```json
{
    "success": true,
    "message": "Vehicle added successfully",
    "data": {
        "Id": 12,
        "UserId": 5,
        "LicensePlate": "NYC-2025",
        "CountryIso": "US",
        "VehicleType": "Car",
        "MakeId": 1,
        "ModelId": 2,
        "CreatedAtUTC": "2026-01-18T12:00:00.000Z"
    }
}
```

### 5. Get My Vehicles
**Endpoint:** `GET /vehicles/my-vehicles`
**Description:** Get list of vehicles owned by logged-in user.

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "User vehicles retrieved",
    "data": [
        {
            "Id": 12,
            "LicensePlate": "NYC-2025",
            "MakeName": "Toyota",
            "ModelName": "Camry"
        }
    ]
}
```

### 6. Search Vehicle (Global)
**Endpoint:** `GET /vehicles/search/:plateNumber`
**Example:** `GET /vehicles/search/XYZ-888`
**Description:** Find info about a specific license plate.

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Vehicle found",
    "data": {
        "Id": 33,
        "LicensePlate": "XYZ-888",
        "CountryIso": "US",
        "VehicleType": "Truck",
        "MakeName": "Ford",
        "ModelName": "F-150"
    }
}
```

---

## Public Data

### 7. Get All Vehicles (Test Route)
**Endpoint:** `GET /vehicles/all`

**Success Response:**
```json
{
    "success": true,
    "data": {
        "vehicles": [ ... ]
    }
}
```

### 8. Get Makes (Lookup)
**Endpoint:** `GET /vehicles/makes`
**Description:** Get list of all car manufacturers.

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Makes retrieved successfully",
    "data": [
        {
            "Id": 1,
            "Name": "Toyota"
        },
        {
            "Id": 2,
            "Name": "Honda"
        }
    ]
}
```

### 9. Get Models (Lookup)
**Endpoint:** `GET /vehicles/models?makeId=1`
**Description:** Get list of models for a specific manufacturer.

**Query Parameters:**
*   `makeId`: The ID of the make (e.g. 1).

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Models retrieved successfully",
    "data": [
        {
            "Id": 101,
            "Name": "Corolla",
            "VehicleType": "Car",
            "MakeId": 1
        },
        {
            "Id": 102,
            "Name": "Camry",
            "VehicleType": "Car",
            "MakeId": 1
        }
    ]
}
```
