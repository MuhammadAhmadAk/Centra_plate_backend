# Centra Plate - Complete API Documentation

Base URL: `http://localhost:8000/api`

## 🔐 Authentication

All protected endpoints require:
```
Authorization: Bearer {token}
```

Admin-only endpoints require the user to have `Role: 'Admin'`.

---

## 📝 Auth Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "displayName": "Ahmad Test",
  "email": "ahmad@test.com",
  "password": "password123",
  "countryIso": "PK",
  "countryName": "Pakistan",
  "language": "English",
  "userTypeId": 1
}
```

**Response (201):**
```json
{
  "status": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "Id": 2,
    "DisplayName": "Ahmad Test",
    "Email": "ahmad@test.com",
    "UserTypeId": 1,
    "CreatedAtUTC": "2026-01-19T00:00:00.000Z"
  }
}
```

### 2. Verify OTP
**POST** `/auth/verify-otp`

**Request Body:**
```json
{
  "email": "ahmad@test.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": 2,
      "displayName": "Ahmad Test",
      "email": "ahmad@test.com",
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "ahmad@test.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 2,
      "displayName": "Ahmad Test",
      "email": "ahmad@test.com",
      "role": "User",
      "countryName": "Pakistan"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Get All Users (Admin Only)
**GET** `/auth/all-users`

**Headers:** `Authorization: Bearer {admin_token}`

**Response (200):**
```json
{
  "status": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "Id": 1,
      "DisplayName": "Super Admin",
      "Email": "admin@admin.com",
      "Role": "Admin",
      "IsVerified": true,
      "CountryIso": "US",
      "CountryName": "United States",
      "CreatedAtUTC": "2026-01-18T00:00:00.000Z"
    }
  ]
}
```

---

## 🚗 Vehicle Endpoints

### 5. Add Vehicle
**POST** `/vehicles/add`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "licensePlate": "LEC-9988",
  "countryIso": "PK",
  "vehicleType": "Car",
  "makeId": 1,
  "modelId": 1
}
```

**Response (201):**
```json
{
  "status": true,
  "message": "Vehicle added successfully",
  "data": {
    "Id": 1,
    "UserId": 2,
    "LicensePlate": "LEC-9988",
    "CountryIso": "PK",
    "VehicleType": "Car",
    "MakeId": 1,
    "ModelId": 1,
    "CreatedAtUTC": "2026-01-19T00:00:00.000Z"
  }
}
```

### 6. Get My Vehicles
**GET** `/vehicles/my-vehicles`

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "status": true,
  "message": "User vehicles retrieved",
  "data": [
    {
      "Id": 1,
      "UserId": 2,
      "LicensePlate": "LEC-9988",
      "CountryIso": "PK",
      "Details": {
        "VehicleType": "Car",
        "Make": {
          "Id": 1,
          "Name": "Abarth"
        },
        "Model": {
          "Id": 1,
          "Name": "124"
        }
      },
      "CreatedAtUTC": "2026-01-19T00:00:00.000Z",
      "ModifiedAtUTC": "2026-01-19T00:00:00.000Z"
    }
  ]
}
```

### 7. Search Vehicle
**GET** `/vehicles/search/{plateNumber}`

**Headers:** `Authorization: Bearer {token}`

**Example:** `/vehicles/search/LEC-9988`

**Response (200):**
```json
{
  "status": true,
  "message": "Vehicle found",
  "data": {
    "Id": 1,
    "UserId": 2,
    "LicensePlate": "LEC-9988",
    "CountryIso": "PK",
    "Details": {
      "VehicleType": "Car",
      "Make": {
        "Id": 1,
        "Name": "Abarth"
      },
      "Model": {
        "Id": 1,
        "Name": "124"
      }
    },
    "CreatedAtUTC": "2026-01-19T00:00:00.000Z",
    "ModifiedAtUTC": "2026-01-19T00:00:00.000Z"
  }
}
```

### 8. Get All Vehicles
**GET** `/vehicles/all`

**Response (200):**
```json
{
  "status": true,
  "message": "All vehicles retrieved",
  "data": {
    "vehicles": [...]
  }
}
```

---

## 🔍 Lookup Endpoints

### 9. Get Makes
**GET** `/vehicles/makes`

**Response (200):**
```json
{
  "status": true,
  "message": "Makes retrieved successfully",
  "data": [
    {
      "Id": 1,
      "Name": "Abarth"
    },
    {
      "Id": 2,
      "Name": "Alfa Romeo"
    }
  ]
}
```

### 10. Get Models
**GET** `/vehicles/models?makeId={id}`

**Query Parameters:**
- `makeId` (required): The ID of the make

**Response (200):**
```json
{
  "status": true,
  "message": "Models retrieved successfully",
  "data": [
    {
      "Id": 1,
      "Name": "124"
    },
    {
      "Id": 2,
      "Name": "500"
    }
  ]
}
```

---

## 📊 Search Logs (Admin Only)

### 11. Get All Search Logs
**GET** `/logs/search`

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `userId` (optional): Filter by user ID
- `startDate` (optional): Filter by date (YYYY-MM-DD)
- `endDate` (optional): Filter by date (YYYY-MM-DD)
- `query` (optional): Search in license plates

**Response (200):**
```json
{
  "status": true,
  "message": "Search logs retrieved successfully",
  "data": {
    "logs": [
      {
        "Id": 1,
        "UserId": 2,
        "UserName": "Ahmad Test",
        "UserEmail": "ahmad@test.com",
        "SearchQuery": "LEC-9988",
        "CountryIso": "PK",
        "CreatedAtUTC": "2026-01-19T00:00:00.000Z",
        "MakeName": "Abarth",
        "ModelName": "124"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 45,
      "limit": 10
    }
  }
}
```

### 12. Get Single Search Log
**GET** `/logs/search/{id}`

**Headers:** `Authorization: Bearer {admin_token}`

**Response (200):**
```json
{
  "status": true,
  "message": "Search log retrieved successfully",
  "data": {
    "Id": 1,
    "UserId": 2,
    "UserName": "Ahmad Test",
    "UserEmail": "ahmad@test.com",
    "SearchQuery": "LEC-9988",
    "CountryIso": "PK",
    "CountryName": "Pakistan",
    "CreatedAtUTC": "2026-01-19T00:00:00.000Z",
    "MakeName": "Abarth",
    "ModelName": "124",
    "VehicleType": "Car"
  }
}
```

### 13. Delete Search Log
**DELETE** `/logs/search/{id}`

**Headers:** `Authorization: Bearer {admin_token}`

**Response (200):**
```json
{
  "status": true,
  "message": "Search log deleted successfully",
  "data": null
}
```

### 14. Get Search Statistics
**GET** `/logs/stats`

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response (200):**
```json
{
  "status": true,
  "message": "Search statistics retrieved successfully",
  "data": {
    "totalSearches": 1250,
    "uniqueUsers": 450,
    "averageResultsPerSearch": "2.78",
    "topSearchQueries": [
      {
        "query": "LEC-9988",
        "count": 125
      }
    ],
    "searchesByCountry": [
      {
        "countryIso": "PK",
        "countryName": "Pakistan",
        "count": 450
      }
    ],
    "searchesByDate": [
      {
        "date": "2026-01-18",
        "count": 45
      }
    ]
  }
}
```

---

## 📥 Reports/Export (Admin Only)

### 15. Export Users
**POST** `/reports/export/users`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**
```json
{
  "format": "csv",
  "filters": {
    "countryIso": "PK",
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  },
  "fields": [
    "Id",
    "DisplayName",
    "Email",
    "CountryName",
    "Role",
    "CreatedAtUTC"
  ]
}
```

**Response:** CSV file download

### 16. Export Vehicles
**POST** `/reports/export/vehicles`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**
```json
{
  "format": "csv",
  "filters": {
    "countryIso": "PK",
    "makeId": 1,
    "modelId": 5,
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  },
  "fields": [
    "Id",
    "LicensePlate",
    "DisplayName",
    "Email",
    "Make",
    "Model",
    "VehicleType",
    "CountryIso",
    "CreatedAtUTC"
  ]
}
```

**Response:** CSV file download

### 17. Export Search Logs
**POST** `/reports/export/logs`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**
```json
{
  "format": "csv",
  "filters": {
    "userId": 2,
    "countryIso": "PK",
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  },
  "fields": [
    "Id",
    "UserName",
    "UserEmail",
    "SearchQuery",
    "CountryIso",
    "CreatedAtUTC"
  ]
}
```

**Response:** CSV file download

---

## ⚠️ Error Responses

All error responses follow this format:

```json
{
  "status": false,
  "message": "Error description",
  "data": null
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## 🔄 Response Format

All successful responses follow this format:

```json
{
  "status": true,
  "message": "Success message",
  "data": { ... }
}
```

---

## 📝 Notes

1. **Search Logging**: Every vehicle search is automatically logged in the `VehicleSearchHistory` table.
2. **Admin Access**: Login with `admin@admin.com` / `admin` to get admin token.
3. **Pagination**: Default page size is 10 records.
4. **Date Filters**: Use ISO format (YYYY-MM-DD) for date parameters.
5. **CSV Export**: Returns actual CSV file with appropriate headers.
