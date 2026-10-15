-- This query lists every table in your database. Look for names that suggest logging or data storage, such as LOGS, MESSAGES, DATA, or something similar to your script's purpose
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'PUBLIC';

_________________________________________________________________________________________________


-- Option 1: Create a Brand New Table

DROP TABLE IF EXISTS click_log;

CREATE TABLE click_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    element_id VARCHAR(255) NOT NULL,
    element_type VARCHAR(50) NULL,
    client_user_id VARCHAR(255) NULL,
    client_timestamp VARCHAR(255) NULL,
    element_name VARCHAR(255) NULL,
    log_timestamp VARCHAR(255) NOT NULL,
    payload JSON NULL,
    INDEX idx_element_id (element_id),
    INDEX idx_user_id (client_user_id)
);

-- Option 2: Alter the Existing Table

-- Run the following commands to add the missing columns to your current `click_log` table:


-- 1. Add element_type
ALTER TABLE click_log ADD COLUMN element_type VARCHAR(50) NULL AFTER element_id;

-- 2. Add client_user_id (we are renaming the 'user_id' from the last step for clarity)
-- Note: If you already added 'user_id' in the last step, run this one instead:
-- ALTER TABLE click_log CHANGE user_id client_user_id VARCHAR(255);
ALTER TABLE click_log ADD COLUMN client_user_id VARCHAR(255) NULL AFTER element_type;

-- 3. Add client_timestamp
ALTER TABLE click_log ADD COLUMN client_timestamp VARCHAR(255) NULL AFTER client_user_id;

-- 4. Add element_name
ALTER TABLE click_log ADD COLUMN element_name VARCHAR(255) NULL AFTER client_timestamp;

-- 5. Ensure the payload field is defined (if it's not already)
ALTER TABLE click_log ADD COLUMN payload JSON NULL AFTER element_name;

-- User Authentication
-- 1. Create the user 'archilog_user'@'localhost' with the correct password, 
-- or update the password if the user already exists.
CREATE USER IF NOT EXISTS 'sa'@'localhost' IDENTIFIED BY 'p@ssw0rd';

-- 2. Grant ALL privileges on the database the server is requesting (archidb.*).
GRANT ALL PRIVILEGES ON graaljs_archidb.* TO 'sa'@'localhost';

-- 3. Reload the privileges.
FLUSH PRIVILEGES;