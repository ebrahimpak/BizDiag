/**
 * GraalJS NIO Server - Single-Threaded Non-Blocking Loop
 * This script runs a pure NIO Selector loop on the main thread. All connections
 * are handled non-blockingly. Logging (JDBC/File I/O) is executed synchronously
 * within the event loop, accepting that these operations are blocking and will
 * momentarily pause the loop.
 *
 * Feel free to set your own preferred database credentials by changing the values
 * of DB_USER and DB_PASS variables in this script. Moreover, your JSONL file will
 * be saved as element_click_log.jsonl
 *
 * --------------------------------------------------------------------------
 *
 * BizDiag — Intelligent Enterprise Architecture & Digital Strategy Automation
 *
 * Copyright © 2026 Ebrahim Pak
 *
 * This file is part of BizDiag.
 *
 * BizDiag is free software distributed under the CeCILL-B Free Software License.
 * See the LICENSE file in the project root for the full license text.
 *
 * SPDX-License-Identifier: CECILL-B
 *
 * @author Ebrahim Pak
 *
 */

// --- 1. Java Imports ---
// Networking and NIO
const InetSocketAddress = Java.type("java.net.InetSocketAddress");
const ServerSocketChannel = Java.type("java.nio.channels.ServerSocketChannel");
const SocketChannel = Java.type("java.nio.channels.SocketChannel");
const Selector = Java.type("java.nio.channels.Selector");
const SelectionKey = Java.type("java.nio.channels.SelectionKey");
const ByteBuffer = Java.type("java.nio.ByteBuffer");

// I/O and Utilities
const StandardCharsets = Java.type("java.nio.charset.StandardCharsets");
const Files = Java.type("java.nio.file.Files");
const Paths = Java.type("java.nio.file.Paths");
const StandardOpenOption = Java.type("java.nio.file.StandardOpenOption"); // open options supported by the standardopenoption enum
const Date = Java.type("java.util.Date");
const SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
const Collections = Java.type("java.util.Collections"); // Used for robust string writing

// H2 JDBC Imports (Updated from MySQL)
const DriverManager = Java.type("java.sql.DriverManager");
const SQLException = Java.type("java.sql.SQLException");
const Statement = Java.type("java.sql.Statement"); // Required for table creation

// --- 2. Configuration & Initialization (UPDATED FOR H2) ---

const DEFAULT_PORT = 9999;
// H2 URL: Persistent file-based database named 'graaljs_archidb'
const DB_URL = "jdbc:h2:./graaljs_archidb";
const DB_USER = "sa"; // Standard H2 user
const DB_PASS = "p@ssw0rd"; // Retaining your desired password
const DB_TABLE_NAME = "click_log";
const JSON_LOG_FILE = "element_click_log.jsonl";

// Constant buffer size for NIO read operation
const buffer = ByteBuffer.allocate(1024);

/**
 * Helper to safely extract an error message from a Java exception or a JS Error object.
 * @param {Error|java.lang.Throwable} e - The exception object.
 * @returns {string} The formatted error message.
 */
function getErrorMessage(e) {
  // Check if the object has a getMessage method (like Java Exceptions)
  if (typeof e.getMessage === "function") {
    return e.getMessage();
  }
  // Fallback to JS error standard properties or toString
  return e.message || e.toString();
}

/**
 * Creates the 'click_log' table if it does not exist.
 * This is crucial for embedded databases like H2.
 */
function createTableIfNotExists() {
  const sql = `CREATE TABLE IF NOT EXISTS ${DB_TABLE_NAME} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      element_id VARCHAR(255) NOT NULL,
      element_type VARCHAR(255),
      client_user_id VARCHAR(255),
      client_timestamp VARCHAR(255),
      element_name VARCHAR(255),
      log_timestamp VARCHAR(255) NOT NULL,
      payload CLOB
  )`; // CLOB is used for the large JSON payload in H2

  let conn = null;
  let stmt = null;

  try {
    // 1. Load the H2 Driver explicitly
    Java.type("org.h2.Driver");

    // 2. Establish connection to create/open the database file
    conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);

    // 3. Create the table
    stmt = conn.createStatement();
    stmt.execute(sql);
    console.log(`[DB INIT] Table '${DB_TABLE_NAME}' ensured to exist.`);
  } catch (e) {
    console.error(
      `[DB FATAL] Failed to initialize database schema: ${getErrorMessage(e)}`
    );
    // Cannot proceed if the table doesn't exist
    Java.type("java.lang.System").exit(1);
  } finally {
    // Cleanup resources
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

// --- 3. Database & I/O Logic (Executed on the Main NIO Thread) ---

/**
 * Helper method to build and bind the PreparedStatement.
 */
function buildStatement(connection, parsedData, rawJsonData) {
  const formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
  const serverLogTime = formatter.format(new Date());

  // --- Extract specific fields from the JSON payload ---
  const elemId = parsedData.elementId;
  const elemType = parsedData.type || "UNKNOWN_TYPE";
  const userId = parsedData.user || "UNKNOWN_USER";
  const clientTimestamp = parsedData.timestamp || serverLogTime;
  const elemName = parsedData.elementName || "N/A";

  if (!elemId) {
    throw new SQLException("JSON is missing the required 'elementId' field.");
  }

  // --- SQL STATEMENT ---
  const sql = `INSERT INTO ${DB_TABLE_NAME} 
        (element_id, element_type, client_user_id, client_timestamp, element_name, log_timestamp, payload) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const preparedStatement = connection.prepareStatement(sql);

  // --- BINDING (7 parameters total) ---
  preparedStatement.setString(1, elemId);
  preparedStatement.setString(2, elemType);
  preparedStatement.setString(3, userId);
  preparedStatement.setString(4, clientTimestamp);
  preparedStatement.setString(5, elemName);
  preparedStatement.setString(6, serverLogTime);
  preparedStatement.setString(7, rawJsonData);

  return preparedStatement;
}

/**
 * Logs the received JSON data to the H2 database and a local file.
 */
function logElementClick(jsonData) {
  let conn = null;
  let stmt = null;
  let parsedData;

  // --- 0. Parse JSON ---
  try {
    parsedData = JSON.parse(jsonData);
  } catch (e) {
    console.error(
      `[FAILURE] JSON Parse Error: The incoming data is not valid JSON. ${getErrorMessage(
        e
      )}`
    );
    return;
  }

  // --- 1. Database Logging (Blocking) ---
  try {
    // Load H2 Driver Class explicitly
    Java.type("org.h2.Driver");
    conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);

    stmt = buildStatement(conn, parsedData, jsonData);
    stmt.executeUpdate();

    const elemId = parsedData.elementId;
    const userId = parsedData.user || "UNKNOWN";
    console.log(
      `[DB SUCCESS] Logged ID ${elemId}, Type: ${
        parsedData.type || "N/A"
      }, User: ${userId} to H2 Database.`
    );
  } catch (e) {
    if (e instanceof SQLException) {
      console.error(`[DB FAILURE] SQL Exception: ${getErrorMessage(e)}`);
    } else {
      console.error(
        `[DB FAILURE] General Error on DB operation: ${getErrorMessage(e)}`
      );
    }
  } finally {
    // Clean up resources manually.
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

  // --- 2. File Logging (Blocking) ---
  try {
    const logLine =
      jsonData.trim() + Java.type("java.lang.System").lineSeparator();

    const logLinesList = Collections.singletonList(logLine);

    Files.write(
      Paths.get(JSON_LOG_FILE),
      logLinesList,
      StandardCharsets.UTF_8,
      StandardOpenOption.CREATE,
      StandardOpenOption.APPEND
    );
    console.log("[FILE SUCCESS] Logged click data to " + JSON_LOG_FILE);
  } catch (e) {
    console.error(
      "[FILE ERROR] Could not write to log file: " + getErrorMessage(e)
    );
  }
}

// --- 4. NIO Server Operation ---

/**
 * Reads data from the channel and executes the logging function synchronously.
 */
function handleRead(key) {
  const channel = key.channel();

  try {
    buffer.clear();
    const bytesRead = channel.read(buffer);

    if (bytesRead === -1) {
      // Client closed connection cleanly
      return;
    }

    buffer.flip();
    const data = StandardCharsets.UTF_8.decode(buffer).toString().trim();

    if (data.length > 0) {
      // Execute the blocking log operation directly
      logElementClick(data);
    }
  } catch (e) {
    console.error(
      `[HANDLER ERROR] Exception reading from channel: ${getErrorMessage(e)}`
    );
  } finally {
    // Close the channel and cancel the key after processing.
    try {
      channel.close();
    } catch (e) {
      /* ignore */
    }
    key.cancel();
  }
}

/**
 * Starts the non-blocking NIO server loop.
 */
function startServer() {
  let ssc = null;
  let selector = null;

  try {
    // --- 4.1 Server Setup ---
    ssc = ServerSocketChannel.open();
    selector = Selector.open();

    ssc.configureBlocking(false);
    ssc.bind(new InetSocketAddress(DEFAULT_PORT));
    ssc.register(selector, SelectionKey.OP_ACCEPT);

    console.log(`[SERVER] NIO Selector Server started on port ${DEFAULT_PORT}`);
    console.log("Waiting for connections...");

    // --- 4.2 Main Selector Loop ---
    while (true) {
      selector.select();

      const keys = selector.selectedKeys().iterator();
      while (keys.hasNext()) {
        const key = keys.next();
        keys.remove();

        if (!key.isValid()) continue;

        if (key.isAcceptable()) {
          const clientChannel = ssc.accept();
          clientChannel.configureBlocking(false);
          clientChannel.register(selector, SelectionKey.OP_READ);
          console.log("[SERVER] Connection accepted and registered for read.");
        } else if (key.isReadable()) {
          handleRead(key);
        }
      }
    }
  } catch (e) {
    console.error(`[SERVER FATAL] Server I/O Error: ${getErrorMessage(e)}`);
  } finally {
    // --- 4.3 Cleanup ---
    if (selector) {
      try {
        selector.close();
      } catch (e) {
        /* ignore */
      }
    }
    if (ssc) {
      try {
        ssc.close();
      } catch (e) {
        /* ignore */
      }
    }
  }
}

// --- 5. Application Entry Point ---

console.log("Starting GraalJS Single-threaded NIO Server...");
// --- H2 Initialization: Ensure table exists before starting the main loop ---
createTableIfNotExists();
startServer();
