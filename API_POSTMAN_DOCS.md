# API Documentation & Postman Examples

Base URL: `https://required-minetta-syntaxsoftwarehouse-63c67cf1.koyeb.app/api`

## 1. Authentication

### A. Register User
*   **Endpoint:** `POST /auth/register`
*   **Description:** Registers a new user and sends an OTP to their email.
*   **Body (JSON):**
    ```json
    {
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "password": "password123"
    }
    ```
*   **Success Response (201):**
    ```json
    {
      "message": "User registered successfully. Please verify your email with the OTP sent.",
      "userId": 1,
      "email": "john.doe@example.com"
    }
    ```

### B. Verify OTP
*   **Endpoint:** `POST /auth/verify-otp`
*   **Description:** Verifies the user's email using the OTP. Returns a JWT token upon success.
*   **Body (JSON):**
    ```json
    {
      "email": "john.doe@example.com",
      "otp": "123456"
    }
    ```
*   **Success Response (200):**
    ```json
    {
      "message": "Email verified successfully",
      "user": {
        "id": 1,
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "role": "user",
        "isVerified": true
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

### C. Login
*   **Endpoint:** `POST /auth/login`
*   **Description:** Logs in an existing verified user.
*   **Body (JSON):**
    ```json
    {
      "email": "john.doe@example.com",
      "password": "password123"
    }
    ```
*   **Success Response (200):**
    ```json
    {
      "message": "Login successful",
      "user": {
        "id": 1,
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "role": "user"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

---

## 2. License Plates
**Note:** All these endpoints require the `Authorization` header.
*   **Header:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

### A. Assign Plate
*   **Endpoint:** `POST /plates/assign`
*   **Description:** Links a vehicle license plate to the logged-in user.
*   **Body (JSON):**
    ```json
    {
      "plateNumber": "ABC-1234"
    }
    ```
*   **Success Response (201):**
    ```json
    {
      "message": "License plate assigned successfully",
      "plate": {
        "id": 1,
        "user_id": 1,
        "plate_number": "ABC-1234",
        "created_at": "2024-12-25T10:00:00.000Z"
      }
    }
    ```

### B. Get My Plate
*   **Endpoint:** `GET /plates/my-plate`
*   **Description:** Retrieves the license plate associated with the current user.
*   **Body:** None
*   **Success Response (200):**
    ```json
    {
      "plate": {
        "id": 1,
        "user_id": 1,
        "plate_number": "ABC-1234",
        "created_at": "2024-12-25T10:00:00.000Z"
      }
    }
    ```

### C. Search Plate
*   **Endpoint:** `GET /plates/search/:plateNumber`
*   **Example:** `GET /plates/search/ABC-1234`
*   **Description:** Searches for a license plate to see if it exists (useful for finding a user to chat with).
*   **Body:** None
*   **Success Response (200):**
    ```json
    {
      "plate": {
        "id": 1,
        "user_id": 1,
        "plate_number": "ABC-1234",
        "created_at": "2024-12-25T10:00:00.000Z"
      }
    }
    ```
