-- If you want to switch from the current in-memory RDBMS, H2, to a Client/server RDBMS, like MySQL:

-- 1. Safely remove the user if it already exists (Prevents Error 1396)
DROP USER IF EXISTS 'archilog_user'@'localhost'; 

-- 2. Create the new database (Safe to run even if it exists)
CREATE DATABASE IF NOT EXISTS graaljs_archidb;

-- 3. Create the dedicated user (Use your actual password here!)
CREATE USER 'sa'@'localhost' IDENTIFIED BY 'p@ssw0rd';

-- 4. Grant the necessary permissions on the new database
GRANT SELECT, INSERT, UPDATE, DELETE ON graaljs_archidb.* TO 'sa'@'localhost';

-- 5. Apply permission changes
FLUSH PRIVILEGES;

-- 6. Use the new database
USE graaljs_archidb;

-- 7. Create the log table
CREATE TABLE click_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    element_id VARCHAR(50) NOT NULL,
    log_timestamp DATETIME NOT NULL,
    payload JSON
);