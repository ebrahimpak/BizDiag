/**
 * Copyright © 2026 Ebrahim Pak
 *
 * SPDX-License-Identifier: CECILL-B
 *
 * This file is part of BizDiag.
 *
 * BizDiag is distributed under the CeCILL-B Free Software License Agreement,
 * Version 1.0. See the LICENSE file for details.
 *
 * The French and English versions of the license are available in
 * LICENSE-FR and LICENSE, respectively.
 *
 * Author: Ebrahim Pak
 *
 * ---------------------------------------------------------------------------------------------------------------------
 *
 * Raw Socket Server using java.net.ServerSocket and Host Interop.
 * This server is SINGLE-THREADED (synchronous) to safely handle
 * client requests sequentially within the GraalJS environment in Archi.
 *
 * This version uses the H2 Database, and JSONL for data storage.
 *
 * NOTE: This script requires the H2 JDBC Connector JAR to be placed
 * in the classpath when running the GraalJS environment.
 *
 */

// --- 1. Java imports ---
// Networking and I/O imports
const ServerSocket = Java.type("java.net.ServerSocket");
const BufferedReader = Java.type("java.io.BufferedReader");
const InputStreamReader = Java.type("java.io.InputStreamReader");
const PrintWriter = Java.type("java.io.PrintWriter");

// SQL imports
const DriverManager = Java.type("java.sql.DriverManager");
const SQLException = Java.type("java.sql.SQLException");

// --- 2. Configuration ---
const SERVER_PORT = 9090;

// *** H2 DATABASE CONFIGURATION ***
const File = Java.type("java.io.File");
const System = Java.type("java.lang.System");
const scriptDir =
  typeof __DIR__ !== "undefined"
    ? new File(__DIR__).getCanonicalPath()
    : System.getProperty("user.dir");
const DB_NAME = "archi_logs";
const DB_URL = "jdbc:h2:file:" + scriptDir + "/" + DB_NAME + ";DB_CLOSE_DELAY=-1";
const DB_USER = "sa"; // H2 default user
const DB_PASS = "p@ssw0rd"; // H2 default password
const DB_TABLE_NAME = "archi_logs"; // The table to store the logs

// Global flag to control the server loop
let isRunning = true;

// --- 3. Database Functions ---

/**
 * Ensures the necessary database table exists. Creates the table if it doesn't already exist.
 * The H2 database file will be created if it doesn't exist when the first connection is made.
 */
function initializeDatabase() {
  let conn = null;
  let stmt = null;

  // Define the table structure (standard SQL, compatible with H2)
  const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${DB_TABLE_NAME} (
            element_id VARCHAR(255) PRIMARY KEY,
            element_name VARCHAR(255) NOT NULL,
            element_type VARCHAR(255) NOT NULL,
            user_name VARCHAR(100),
            log_timestamp VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

  try {
    // Load the H2 Driver
    Java.type("org.h2.Driver");

    // Attempt to connect to the database
    conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);

    // Do NOT drop the table on startup. Preserve existing data between restarts.
    // Ensure the statement object is available for table creation below.
    stmt = conn.createStatement();

    // Execute the table creation statement
    stmt.executeUpdate(createTableSQL);

    console.log(
      `[DB] H2 Database initialized (persistent): '${DB_TABLE_NAME}' table ensured to exist.`
    );
  } catch (e) {
    if (e instanceof SQLException) {
      // Handle SQL specific errors
      console.error(
        `[DB SETUP FATAL] Could not initialize H2 database table. Check the H2 driver dependency.`
      );
      console.error(`SQL Error (${e.getSQLState()}): ${e.getMessage()}`);
      throw e;
    } else {
      // Handle other types of errors (e.g., driver not found)
      const errorMessage = e && e.message ? e.message : e.toString();
      console.error(
        `[DB SETUP FATAL] General Initialization Error: ${errorMessage}`
      );
      throw e;
    }
  } finally {
    // Clean up resources regardless of success or failure
    if (stmt) {
      try {
        stmt.close();
      } catch (e) {
        /* ignore */
      }
    }
    if (conn) {
      try {
        conn.close();
      } catch (e) {
        /* ignore */
      }
    }
  }
}

/**
 * Inserts a single element log record into the H2 database.
 * @param {object} elementLog - The parsed JSON object.
 */
function insertElementLog(elementLog) {
  let conn = null;
  let stmt = null;

  // Uses prepared statement to insert data
  const sql = `INSERT INTO ${DB_TABLE_NAME} 
              (element_id, element_name, element_type, user_name, log_timestamp) 
              VALUES (?, ?, ?, ?, ?)`;

  try {
    // Load the H2 Driver (redundant but safe)
    Java.type("org.h2.Driver");
    conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);

    // Prepare statement for safety against SQL injection
    stmt = conn.prepareStatement(sql);

     // Generate current timestamp on the SERVER (not from stale client data)
     const currentTimestamp = new Date().toISOString();
 
     // Correct bindings: match INSERT column order exactly
     stmt.setString(1, elementLog.elementId || elementLog.id || ""); // element_id
     stmt.setString(2, elementLog.elementName || ""); // element_name
     stmt.setString(3, elementLog.type || elementLog.elementType || ""); // element_type
     stmt.setString(4, elementLog.user || ""); // user_name
     stmt.setString(5, currentTimestamp); // log_timestamp (server timestamp)

    const rowsAffected = stmt.executeUpdate();
    console.log(
      `[DB] Logged: ${elementLog.elementName}. Rows: ${rowsAffected}`
    );
  } catch (e) {
    if (e instanceof SQLException) {
      console.error(
        `[DB ERROR] SQL Exception (${e.getSQLState()}): ${e.getMessage()}`
      );
    } else {
      const errorMessage = e && e.message ? e.message : e.toString();
      console.error(`[DB ERROR] General Error: ${errorMessage}`);
    }
  } finally {
    // Clean up resources
    if (stmt) {
      try {
        stmt.close();
      } catch (e) {
        /* ignore */
      }
    }
    if (conn) {
      try {
        conn.close();
      } catch (e) {
        /* ignore */
      }
    }
  }
}

// --- 4. Client Handler Logic ---

/**
 * Handles a single client connection synchronously.
 * @param {java.net.Socket} clientSocket
 */
function handleClient(clientSocket) {
  let reader = null;
  let writer = null;
  let content = "";
  let contentLength = 0;
  let currentLine;

  try {
    // Initialize input/output streams
    reader = new BufferedReader(
      new InputStreamReader(clientSocket.getInputStream(), "UTF-8")
    );
    writer = new PrintWriter(clientSocket.getOutputStream(), true); // Auto-flush

    // --- 4.1 Read HTTP Headers and find Content-Length ---
    while ((currentLine = reader.readLine()) !== null) {
      // Explicitly convert Java String to JS string for reliable property access
      const line = currentLine.toString();

      if (line.length === 0) {
        // Found the blank line separating headers from body
        break;
      }

      // Check for the Content-Length header to determine payload size
      if (line.startsWith("Content-Length:")) {
        contentLength = parseInt(
          line.substring("Content-Length:".length).trim()
        );
      }
    }

    // --- 4.2 Read HTTP Body (JSON Payload) ---
    if (contentLength > 0) {
      // Create a character array buffer
      const charBuffer = new (Java.type("char[]"))(contentLength);
      let bytesRead = 0;
      let totalRead = 0;

      // Read the payload based on Content-Length
      while (
        totalRead < contentLength &&
        (bytesRead = reader.read(
          charBuffer,
          totalRead,
          contentLength - totalRead
        )) !== -1
      ) {
        totalRead += bytesRead;
      }

      // Convert Java character array buffer to a JavaScript string
      content = new java.lang.String(charBuffer, 0, totalRead);
    }

    // --- 4.3 Process Payload (Only if Content was received) ---
    if (content) {
      const elementLog = JSON.parse(content);
      insertElementLog(elementLog); // Synchronously insert into DB
    } else {
      console.warn("[SERVER] Received request with no payload.");
      throw new Error("Missing request payload.");
    }

    // --- 4.4 Send 200 OK Response ---
    const responseBody = "Log recorded successfully by H2 server.";
    const httpResponse =
      "HTTP/1.1 200 OK\r\n" +
      "Content-Type: text/plain\r\n" +
      "Content-Length: " +
      responseBody.length +
      "\r\n" +
      "Connection: close\r\n" +
      "\r\n" +
      responseBody;

    writer.write(httpResponse);
    writer.flush();
  } catch (e) {
    // Log and respond with 500
    const errorMessage = e && e.message ? e.message : e.toString();
    console.error(
      `[SERVER] Error handling client ${clientSocket.getInetAddress()}: ${errorMessage}`
    );
    const errorBody = "Server Error: " + errorMessage;
    const errorResponse =
      "HTTP/1.1 500 Internal Server Error\r\n" +
      "Content-Type: text/plain\r\n" +
      "Content-Length: " +
      errorBody.length +
      "\r\n" +
      "Connection: close\r\n" +
      "\r\n" +
      errorBody;
    if (writer) {
      writer.write(errorResponse);
      writer.flush();
    }
  } finally {
    // Cleanup
    try {
      if (reader) reader.close();
      if (writer) writer.close();
      if (clientSocket && !clientSocket.isClosed()) clientSocket.close();
    } catch (e) {
      /* ignore */
    }
  }
}

// --- 5. Server Setup ---

/**
 * Starts the ServerSocket listener loop.
 */
function startServer() {
  let serverSocket = null;

  try {
    // Initialize DB structure before starting the server socket
    initializeDatabase();

    serverSocket = new ServerSocket(SERVER_PORT);
    console.log(
      `[SERVER] H2 Socket Server Started. Listening on port ${SERVER_PORT}...`
    );

    // This loop runs indefinitely until 'isRunning' is false
    while (isRunning) {
      // Blocking call: waits for a client connection
      const clientSocket = serverSocket.accept();

      console.log(
        `[SERVER] New client connected from: ${clientSocket
          .getInetAddress()
          .getHostAddress()}`
      );

      // SYNCHRONOUS CALL: The server thread handles the connection
      handleClient(clientSocket);
    }
  } catch (e) {
    if (isRunning) {
      // Only log error if not a deliberate shutdown
      const errorMessage = e && e.message ? e.message : e.toString();
      console.error(`[SERVER FATAL] Server Socket Error: ${errorMessage}`);
    }
  } finally {
    // Shutdown sequence
    isRunning = false;
    if (serverSocket) {
      try {
        serverSocket.close();
        console.log("[SERVER] Server Socket Closed.");
      } catch (e) {
        /* ignore */
      }
    }
  }
}

// Start the application on the main GraalJS thread
console.log("Starting GraalJS Raw Socket Server...");
startServer();
