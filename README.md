# Centra Plate Backend

This is the backend for the Centra Plate mobile application.

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Database Setup:**
    - Create a PostgreSQL database (e.g., `centra_plate`).
    - Run the SQL scripts in `schema.sql` to create the necessary tables.
    
    You can use a tool like pgAdmin or psql:
    ```bash
    psql -U postgres -d centra_plate -f schema.sql
    ```

3.  **Environment Variables:**
    - Rename `.env.example` (if exists) or check `.env`.
    - Update `.env` with your database credentials and other settings.

    ```env
    PORT=3000
    DB_USER=postgres
    DB_HOST=localhost
    DB_DATABASE=centra_plate
    DB_PASSWORD=your_password
    DB_PORT=5432
    JWT_SECRET=your_super_secret_key
    ```

4.  **Run the Server:**
    - Development:
      ```bash
      npm run dev
      ```
    - Production:
      ```bash
      npm start
      ```

## Features Implemented

- **Authentication**: Register (`/api/auth/register`) and Login (`/api/auth/login`).
- **License Plates**: Assign unique plates (`/api/plates/assign`), Search (`/api/plates/search/:number`), Get My Plate (`/api/plates/my-plate`).
- **Messaging**: Real-time messaging via Socket.io. Messages are stored in the PostgreSQL database.
    - Connect to socket.
    - Emit `identify` event with `userId` to join your private channel.
    - Emit `send_message` with `{ senderId, receiverId, content }`.
    - Listen for `receive_message`.

## Technologies

- Node.js
- Express.js
- PostgreSQL (pg)
- Socket.io
- JWT for Authentication
