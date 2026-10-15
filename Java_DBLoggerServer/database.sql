-- This query lists every table in your database. Look for names that suggest logging or data storage, such as LOGS, MESSAGES, DATA, or something similar to your script's purpose
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'PUBLIC';



-- 1. Safely remove the user if it already exists (Prevents Error 1396)
DROP USER IF EXISTS 'archilog_user'@'localhost'; 

-- 2. Create the new database (Safe to run even if it exists)
CREATE DATABASE IF NOT EXISTS Jarchilogdb; 

-- 3. Create the dedicated user (Use your actual password here!)
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'p@ssw0rd';

-- 4. Grant the necessary permissions on the new database
GRANT SELECT, INSERT, UPDATE, DELETE ON Jarchilogdb.* TO 'archilog_user'@'localhost';

-- 5. Apply permission changes
FLUSH PRIVILEGES;

-- 6. Use the new database
USE Jarchilogdb;

-- 7. Create the log table
CREATE TABLE click_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    element_id VARCHAR(50) NOT NULL,
    log_timestamp DATETIME NOT NULL,
    payload JSON
);