-- This query lists every table in your database. Look for names that suggest logging or data storage, such as LOGS, MESSAGES, DATA, or something similar to your script's purpose
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'PUBLIC';

_______________________________________________________________________________
-- archilogdb / GraalJSRESTServer.js

-- 1. Create the database 'archilogdb' which the server script requires.
CREATE DATABASE IF NOT EXISTS archilogdb;

-- 2. Ensure the user exists (creates or updates the user 'archilog_user'@'localhost').
-- Use the password specified in your JavaScript file (Kmp9121442365).
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'p@ssw0rd';

-- 3. Grant ALL privileges on the newly created 'archilogdb' database to the user.
GRANT ALL PRIVILEGES ON archilogdb.* TO 'archilog_user'@'localhost';

-- 4. Reload the privileges so the changes take effect immediately.
FLUSH PRIVILEGES;