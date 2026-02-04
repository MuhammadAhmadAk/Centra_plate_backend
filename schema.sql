-- Drop tables to ensure clean slate for new schema structure
DROP TABLE IF EXISTS "VehicleSearchHistory" CASCADE;
DROP TABLE IF EXISTS "UserOtpVerification" CASCADE;
DROP TABLE IF EXISTS "Vehicle" CASCADE;
DROP TABLE IF EXISTS "Model" CASCADE;
DROP TABLE IF EXISTS "Make" CASCADE;
DROP TABLE IF EXISTS "TypeMatch" CASCADE;
DROP TABLE IF EXISTS "Color" CASCADE;
DROP TABLE IF EXISTS "UserType" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 1. UserType (Roles)
CREATE TABLE "UserType" (
    "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Type" VARCHAR(20) NOT NULL UNIQUE,
    "CreatedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "ModifiedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
);

INSERT INTO "UserType" ("Type") VALUES ('User'), ('Admin') ON CONFLICT ("Type") DO NOTHING;

-- 2. Color
CREATE TABLE "Color" (
    "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Name" VARCHAR(30) NOT NULL UNIQUE,
    "HexCode" VARCHAR(7),
    "CreatedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "ModifiedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
);

INSERT INTO "Color" ("Name", "HexCode") VALUES
('Beige','#F5F5DC'), ('Black','#000000'), ('Blue','#0033A0'), ('Brown','#6F4E37'),
('Green','#006400'), ('Grey','#808080'), ('Orange','#FF8C00'), ('Other',NULL),
('Red','#C8102E'), ('Silver','#C0C0C0'), ('White','#FFFFFF'), ('Yellow','#FFD700')
ON CONFLICT ("Name") DO NOTHING;

-- 3. TypeMatch
CREATE TABLE "TypeMatch" (
    "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Type" VARCHAR(20) NOT NULL UNIQUE,
    "CreatedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "ModifiedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
);

INSERT INTO "TypeMatch" ("Type") VALUES
('Exact'), ('StartsWith'), ('EndsWith'), ('Contains')
ON CONFLICT ("Type") DO NOTHING;

-- 4. Make
CREATE TABLE "Make" (
    "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Name" VARCHAR(60) NOT NULL UNIQUE,
    "CreatedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "ModifiedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- 5. Model
CREATE TABLE "Model" (
    "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Name" VARCHAR(80) NOT NULL,
    "VehicleType" VARCHAR(20) NOT NULL, 
    "MakeId" INT NOT NULL,
    "CreatedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "ModifiedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    
    CONSTRAINT "FK_Model_Make" FOREIGN KEY ("MakeId") REFERENCES "Make"("Id") ON DELETE RESTRICT,
    CONSTRAINT "UX_Model_Make_VehicleType_Name" UNIQUE ("MakeId", "VehicleType", "Name")
);

-- 6. User
-- Removed 'Verified' column as per user request to rely on OTP table
CREATE TABLE "User" (
    "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "DisplayName" VARCHAR(50) NOT NULL,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "UserTypeId" INT NOT NULL,
    "Language" VARCHAR(50) NOT NULL, 
    "CountryIso" CHAR(2) NOT NULL, 
    "CountryName" VARCHAR(100) NOT NULL,
    "ProfilePicURL" VARCHAR(255),
    "Bio" TEXT,
    "CreatedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "ModifiedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),

    CONSTRAINT "FK_User_UserType" FOREIGN KEY ("UserTypeId") REFERENCES "UserType"("Id")
);

-- 7. UserOtpVerification
CREATE TABLE "UserOtpVerification" (
    "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserId" INT NOT NULL,
    "Code" CHAR(6) NOT NULL,
    "ExpiresAtUTC" TIMESTAMP NOT NULL,
    "Redeemed" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "ModifiedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),

    CONSTRAINT "FK_Otp_User" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE CASCADE
);

-- 8. Vehicle
CREATE TABLE "Vehicle" (
    "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserId" INT,
    "LicensePlate" VARCHAR(20) NOT NULL,
    "CountryIso" CHAR(2) NOT NULL,
    "VehicleType" VARCHAR(20),
    "MakeId" INT,
    "ModelId" INT,
    "CreatedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "ModifiedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),

    CONSTRAINT "FK_Vehicle_User" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Vehicle_Make" FOREIGN KEY ("MakeId") REFERENCES "Make"("Id"),
    CONSTRAINT "FK_Vehicle_Model" FOREIGN KEY ("ModelId") REFERENCES "Model"("Id"),
    CONSTRAINT "CK_Vehicle_LicensePlate_Uppercase" CHECK ("LicensePlate" = UPPER(TRIM("LicensePlate"))),
    CONSTRAINT "UX_Vehicle_Country_Plate" UNIQUE ("CountryIso", "LicensePlate")
);

-- 9. VehicleSearchHistory
CREATE TABLE "VehicleSearchHistory" (
    "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserId" INT NOT NULL,
    "LicensePlate" VARCHAR(20),
    "CountryIso" CHAR(2) NOT NULL,
    "MakeId" INT,
    "ModelId" INT,
    "VehicleType" VARCHAR(20),
    "ColorId" INT,
    "TypeMatchId" INT NOT NULL,
    "CreatedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "ModifiedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),

    CONSTRAINT "FK_History_User" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_History_Make" FOREIGN KEY ("MakeId") REFERENCES "Make"("Id"),
    CONSTRAINT "FK_History_Model" FOREIGN KEY ("ModelId") REFERENCES "Model"("Id"),
    CONSTRAINT "FK_History_Color" FOREIGN KEY ("ColorId") REFERENCES "Color"("Id"),
    CONSTRAINT "FK_History_TypeMatch" FOREIGN KEY ("TypeMatchId") REFERENCES "TypeMatch"("Id")
);

-- 10. ExportHistory
CREATE TABLE "ExportHistory" (
    "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "ExportId" VARCHAR(50) UNIQUE NOT NULL,
    "Type" VARCHAR(20) NOT NULL,
    "Format" VARCHAR(10) NOT NULL DEFAULT 'csv',
    "Status" VARCHAR(20) NOT NULL DEFAULT 'completed',
    "RecordCount" INT DEFAULT 0,
    "FileSizeBytes" INT DEFAULT 0,
    "FileName" VARCHAR(255),
    "ErrorMessage" TEXT,
    "CreatedByUserId" INT NOT NULL,
    "CreatedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "ExpiresAtUTC" TIMESTAMP,
    
    CONSTRAINT "FK_Export_User" FOREIGN KEY ("CreatedByUserId") REFERENCES "User"("Id") ON DELETE CASCADE
);

-- SEED DATA --

-- Make
INSERT INTO "Make" ("Name") VALUES
('Abarth'), ('Alfa Romeo'), ('Alpine'), ('Aston Martin'), ('Audi'), ('Bentley'), ('BMW'), ('Bugatti'), ('Cadillac'), ('Can-Am'), ('Chevrolet'), ('Chrysler'), ('Citroen'), ('Dacia'), ('Daewoo'), ('Daihatsu'), ('Datsun'), ('Dodge'), ('Donkervoort'), ('DS'), ('Ferrari'), ('Fiat'), ('Fisker'), ('Ford'), ('Honda'), ('Hummer'), ('Hyundai'), ('Infiniti'), ('Jaguar'), ('Jeep'), ('Kia'), ('Lada'), ('Lamborghini'), ('Lancia'), ('Land-Rover'), ('Landwind'), ('Lexus'), ('Lightyear'), ('Lotus'), ('Maserati'), ('Mazda'), ('McLaren'), ('Mercedes-Benz'), ('MG'), ('Mini'), ('Mitsubishi'), ('Nissan'), ('Opel'), ('Peugeot'), ('Porsche'), ('Qoros'), ('Renault'), ('Rolls-Royce'), ('Rover'), ('Saab'), ('Seat'), ('Skoda'), ('Smart'), ('Spyker'), ('Ssangyong'), ('Subaru'), ('Suzuki'), ('Tesla'), ('Toyota'), ('Volkswagen'), ('Volvo'), ('Wiesmann')
ON CONFLICT ("Name") DO NOTHING;

-- Model
INSERT INTO "Model" ("Name", "VehicleType", "MakeId") VALUES
-- MakeId 1 (Abarth)
('124','Car',1), ('500','Car',1), ('595','Car',1), ('695','Car',1), ('124 Spider','Car',1), ('500c','Car',1), ('Punto','Car',1),
-- MakeId 2 (Alfa Romeo)
('147','Car',2), ('156','Car',2), ('159','Car',2), ('Giulia','Car',2), ('Stelvio','Car',2), ('MiTo','Car',2), ('Giulietta','Car',2),
-- MakeId 5 (Audi)
('A1','Car',5), ('A3','Car',5), ('A4','Car',5), ('A5','Car',5), ('A6','Car',5), ('Q3','Car',5), ('Q5','Car',5), ('Q7','Car',5),
-- MakeId 7 (BMW)
('1-serie','Car',7), ('3-serie','Car',7), ('5-serie','Car',7), ('X1','Car',7), ('X3','Car',7), ('X5','Car',7),
-- MakeId 11 (Chevrolet)
('Camaro','Car',11), ('Corvette','Car',11), ('Spark','Car',11),
-- MakeId 21 (Ferrari)
('488','Car',21), ('F8 Tributo','Car',21),
-- MakeId 24 (Ford)
('Fiesta','Car',24), ('Focus','Car',24), ('Mustang','Car',24), ('Kuga','Car',24),
-- MakeId 25 (Honda)
('Civic','Car',25), ('CR-V','Car',25), ('Jazz','Car',25),
-- MakeId 31 (Kia)
('Picanto','Car',31), ('Rio','Car',31), ('Ceed','Car',31), ('Sportage','Car',31),
-- MakeId 43 (Mercedes)
('Aklasse','Car',43), ('Cklasse','Car',43), ('Eklasse','Car',43), ('Sklasse','Car',43),
-- MakeId 64 (Toyota)
('Yaris','Car',64), ('Corolla','Car',64), ('RAV4','Car',64), ('Camry','Car',64),
-- MakeId 65 (Volkswagen)
('Golf','Car',65), ('Polo','Car',65), ('Passat','Car',65), ('Tiguan','Car',65)
ON CONFLICT DO NOTHING;
