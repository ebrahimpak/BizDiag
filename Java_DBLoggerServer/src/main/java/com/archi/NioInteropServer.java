/*
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
 * NioInteropServer.java
 * version2.0
 *
 * This a vanilla Java server, running as a standalone java program, outside Archi and jArchi environment. I used this
 * particular architecture, for use-cases, like corporate internal regulations, that mandate the use of pure Java
 * programs, rather than using runtime implementations, e.g., GraalJs.
 *
 */

package com.archi;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Date;
import java.util.Iterator;
import org.json.JSONException;
import org.json.JSONObject;

public class NioInteropServer {

    // --- Constants ---
    private static final int DEFAULT_PORT = 9999;

    // H2 URL: Persistent file-based database named 'jarchilogdb' in the current
    // directory.
    private static final String DB_URL = "jdbc:h2:./jarchilogdb";
    private static final String DB_USER = "sa"; // Standard H2 default user
    private static final String DB_PASS = "p@ssw0rd"; // Standard H2 empty password

    private static final String JSON_LOG_FILE = "element_click_log.jsonl";
    private static final ByteBuffer buffer = ByteBuffer.allocate(1024); // Constant buffer size

    /**
     * Creates the 'click_log' table if it does not exist.
     * This ensures the application is ready to run immediately with a fresh H2
     * database.
     */
    private static void createTableIfNotExists() {
        final String sql = "CREATE TABLE IF NOT EXISTS click_log ("
                + "id INT AUTO_INCREMENT PRIMARY KEY,"
                + "element_id VARCHAR(255) NOT NULL,"
                + "log_timestamp VARCHAR(255) NOT NULL,"
                + "payload CLOB" // CLOB is suitable for storing large JSON payloads in H2
                + ")";

        try (Connection connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
                Statement statement = connection.createStatement()) {

            statement.execute(sql);
            System.out.println("[DB] 'click_log' table ensured to exist (created or verified).");

        } catch (SQLException e) {
            System.err.println("FATAL DB ERROR: Failed to create table: " + e.getMessage());
            System.exit(1);
        }
    }

    /**
     * Logs the received JSON data to the H2 database and a local file.
     */
    private static void logElementClick(String jsonData) {
        // --- 1. Database Logging (Using Try-with-Resources) ---
        try (Connection connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
                PreparedStatement preparedStatement = buildStatement(connection, jsonData)) {

            preparedStatement.executeUpdate();

            // Re-parse the JSON to get the element ID for a clean log message
            JSONObject received = new JSONObject(jsonData);
            String elemId = received.getString("elementId");
            System.out.println("[DB] Logged element ID " + elemId + " to H2 Database.");

        } catch (SQLException e) {
            System.err.println("FATAL DB ERROR: SQL Exception: " + e.getMessage());
        } catch (JSONException e) {
            System.err.println("FATAL DB ERROR: Could not insert data (JSON Parse Error): " + e.getMessage());
        }

        // --- 2. File Logging (Separate and independent) ---
        try {
            // Append the JSON string and a newline using JSON Lines format
            Files.write(
                    Paths.get(JSON_LOG_FILE),
                    (jsonData.trim() + System.lineSeparator()).getBytes(StandardCharsets.UTF_8),
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND);
            System.out.println("[FILE] Logged click data to " + JSON_LOG_FILE);
        } catch (IOException e) {
            System.err.println("[FILE ERROR] Could not write to log file: " + e.getMessage());
        }
    }

    /** Helper method to build and bind the PreparedStatement */
    private static PreparedStatement buildStatement(Connection connection, String jsonData)
            throws SQLException, JSONException {
        JSONObject received = new JSONObject(jsonData);
        String elemId = received.getString("elementId");

        // Use java.util.Date for SimpleDateFormat compatibility
        String logTime = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());

        final String sql = "INSERT INTO click_log (element_id, log_timestamp, payload) VALUES (?, ?, ?)";
        PreparedStatement preparedStatement = connection.prepareStatement(sql);

        preparedStatement.setString(1, elemId); // element_id
        preparedStatement.setString(2, logTime); // log_timestamp
        preparedStatement.setString(3, jsonData); // payload

        return preparedStatement;
    }

    // --- NIO Server Operation ---

    private static void handleRead(SelectionKey key) throws IOException {
        try (SocketChannel channel = (SocketChannel) key.channel()) {
            buffer.clear();
            int bytesRead = channel.read(buffer);
            if (bytesRead == -1) { // Client closed connection cleanly
                channel.close();
                key.cancel();
                return;
            }
            buffer.flip();
            // Decode the bytes to a String
            String data = StandardCharsets.UTF_8.decode(buffer).toString().trim();
            // Log the received data
            if (!data.isEmpty()) {
                logElementClick(data);
            }
            // Close the channel after logging (client is done)
        }
        key.cancel();
    }

    private static void startServer() throws IOException {
        // Using Try-with-Resources for ServerSocketChannel and Selector for reliability
        try (ServerSocketChannel ssc = ServerSocketChannel.open();
                Selector selector = Selector.open()) {
            ssc.configureBlocking(false);
            ssc.bind(new InetSocketAddress(DEFAULT_PORT));
            ssc.register(selector, SelectionKey.OP_ACCEPT);

            System.out.println("Server starting ... listening on port " + DEFAULT_PORT);
            System.out.println("Waiting for connections...");

            while (true) {
                selector.select();

                Iterator<SelectionKey> keys = selector.selectedKeys().iterator();
                while (keys.hasNext()) {
                    SelectionKey key = keys.next();
                    keys.remove();

                    if (!key.isValid())
                        continue;

                    if (key.isAcceptable()) {
                        SocketChannel clientChannel = ssc.accept();
                        clientChannel.configureBlocking(false);
                        clientChannel.register(selector, SelectionKey.OP_READ);
                        System.out.println("[SERVER] Connection accepted and registered for read.");
                    } else if (key.isReadable()) {
                        handleRead(key);
                    }
                }
            }
        } // Resources are closed automatically here
    }

    // --- Application Entry Point ---

    public static void main(String[] args) {
        try {
            // --- 1. Load H2 Driver ---
            Class.forName("org.h2.Driver");
            System.out.println("[DB] H2 Driver loaded successfully.");

            // --- 2. Ensure Table Exists ---
            createTableIfNotExists();

            // --- 3. Start Server ---
            startServer();
        } catch (ClassNotFoundException e) {
            System.err.println("FATAL DRIVER ERROR: H2 Driver class not found. Ensure h2-*.jar is on the classpath!");
            System.exit(1);
        } catch (IOException e) {
            System.err.println("Fatal Server I/O Error: " + e.getMessage());
            System.exit(1);
        }
    }
}