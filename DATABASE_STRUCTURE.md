# Centra Plate - Database Structure & Schema

This system uses a **PostgreSQL** database with PascalCase naming conventions.

---

## 1. Core Lookup Tables

### **UserType**
Defines user roles.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | **PK** | Unique identifier |
| `Type` | VARCHAR(20) | **Unique**, Not Null | e.g. 'User', 'Admin' |
| `CreatedAtUTC` | TIMESTAMP | Default: NOW() | UTC creation time |
| `ModifiedAtUTC` | TIMESTAMP | Default: NOW() | UTC modification time |

### **Color**
Vehicle colors.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | **PK** | Unique identifier |
| `Name` | VARCHAR(30) | **Unique**, Not Null | e.g. 'Red' |
| `HexCode` | VARCHAR(7) | Nullable | Hex e.g. '#FF0000' |
| `CreatedAtUTC` | TIMESTAMP | Default: NOW() | UTC creation time |
| `ModifiedAtUTC` | TIMESTAMP | Default: NOW() | UTC modification time |

### **TypeMatch**
Search match types.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | **PK** | Unique identifier |
| `Type` | VARCHAR(20) | **Unique**, Not Null | e.g. 'Exact' |
| `CreatedAtUTC` | TIMESTAMP | Default: NOW() | UTC creation time |
| `ModifiedAtUTC` | TIMESTAMP | Default: NOW() | UTC modification time |

---

## 2. Vehicle Catalog Tables

### **Make**
Manufacturers.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | **PK** | Unique identifier |
| `Name` | VARCHAR(60) | **Unique**, Not Null | e.g. 'Toyota' |
| `CreatedAtUTC` | TIMESTAMP | Default: NOW() | UTC creation time |
| `ModifiedAtUTC` | TIMESTAMP | Default: NOW() | UTC modification time |

### **Model**
Vehicle models.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | **PK** | Unique identifier |
| `Name` | VARCHAR(80) | Not Null | e.g. 'Corolla' |
| `VehicleType` | VARCHAR(20) | Not Null | e.g. 'Car' |
| `MakeId` | INT | **FK** -> `Make(Id)` | |
| `CreatedAtUTC` | TIMESTAMP | Default: NOW() | UTC creation time |
| `ModifiedAtUTC` | TIMESTAMP | Default: NOW() | UTC modification time |

---

## 3. User & Authentication Tables

### **User**
User profile.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | **PK** | Unique identifier |
| `DisplayName` | VARCHAR(50) | Not Null | |
| `Email` | VARCHAR(255) | **Unique**, Not Null | |
| `PasswordHash` | VARCHAR(255) | Not Null | |
| `UserTypeId` | INT | **FK** -> `UserType(Id)` | |
| `Language` | VARCHAR(50) | Not Null | User input string (e.g. 'English') |
| `CountryIso` | CHAR(2) | Not Null | e.g. 'US' |
| `CountryName` | VARCHAR(100) | Not Null | e.g. 'United States' |
| `ProfilePicURL` | VARCHAR(255) | Nullable | |
| `CreatedAtUTC` | TIMESTAMP | Default: NOW() | UTC creation time |
| `ModifiedAtUTC` | TIMESTAMP | Default: NOW() | UTC modification time |

### **UserOtpVerification**
OTP Codes.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | **PK** | Unique identifier |
| `UserId` | INT | **FK** -> `User(Id)` | |
| `Code` | CHAR(6) | Not Null | |
| `ExpiresAtUTC` | TIMESTAMP | Not Null | |
| `Redeemed` | BOOLEAN | Default: FALSE | Used to check verification status |
| `CreatedAtUTC` | TIMESTAMP | Default: NOW() | |
| `ModifiedAtUTC` | TIMESTAMP | Default: NOW() | |

---

## 4. Vehicle Registration & History

### **Vehicle**
Registered vehicles.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | **PK** | Unique identifier |
| `UserId` | INT | **FK** -> `User(Id)` | |
| `LicensePlate` | VARCHAR(20) | Not Null | Uppercase |
| `CountryIso` | CHAR(2) | Not Null | |
| `VehicleType` | VARCHAR(20) | Nullable | |
| `MakeId` | INT | **FK** -> `Make(Id)` | |
| `ModelId` | INT | **FK** -> `Model(Id)` | |
| `CreatedAtUTC` | TIMESTAMP | Default: NOW() | |
| `ModifiedAtUTC` | TIMESTAMP | Default: NOW() | |

### **VehicleSearchHistory**
Search logs.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | **PK** | Unique identifier |
| `UserId` | INT | **FK** -> `User(Id)` | |
| `LicensePlate` | VARCHAR(20) | Nullable | |
| `CountryIso` | CHAR(2) | Not Null | |
| `MakeId` | INT | **FK** -> `Make(Id)` | |
| `ModelId` | INT | **FK** -> `Model(Id)` | |
| `VehicleType` | VARCHAR(20) | Nullable | |
| `ColorId` | INT | **FK** -> `Color(Id)` | |
| `TypeMatchId` | INT | **FK** -> `TypeMatch(Id)` | |
| `CreatedAtUTC` | TIMESTAMP | Default: NOW() | |
| `ModifiedAtUTC` | TIMESTAMP | Default: NOW() | |
