/*
 * Provides REST API communication with the AI service using JSON data exchange. It is served as the AI Support package s
 * for Archi with JSON exchange format.
 *
 * Requires LLaMA3.1:latest API & 'AI_REST_JSON.js'
 *
 * Version: 2.0
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
 */

console.log("Loading AI Support package with JSON storage (v2.0)");

/**
 * Java I/O Evolution and Core Concepts
 *
 * Historical Progression:
 * 1. java.io (JDK 1.0, 1996):
 *    - Stream-based, blocking I/O
 *    - One byte/character at a time processing
 *    - Synchronous operations only
 *
 * 2. java.nio (JDK 1.4, 2002):
 *    - Channel-based I/O
 *    - Buffer-oriented operations
 *    - Selector mechanism for non-blocking I/O
 *
 * 3. java.nio.file (NIO.2, JDK 7, 2011):
 *    - Modern file system operations
 *    - Symbolic link support
 *    - File attributes and ACL manipulation
 *    - Watch service for directory changes
 *
 * Key Components Used in This Module:
 *
 * Network Programming:
 * - HttpURLConnection: Subclass of URLConnection specifically for HTTP
 *   Benefits: Cookie handling, request methods (GET/POST), response codes
 *   Usage: RESTful API interactions, web service calls
 *
 * Character Encoding & Buffering:
 * - BufferedReader/Writer: Implements the Decorator pattern
 *   Purpose: Reduces system calls by buffering data
 *   Performance: Significantly faster than unbuffered I/O
 *
 * Stream Processing:
 * - InputStreamReader: Bridge between byte streams and character streams
 *   Function: Converts bytes to characters using specified charset
 *   Use case: Reading text from network or files with proper encoding
 *
 * - OutputStreamWriter: Opposite of InputStreamReader
 *   Function: Converts characters to bytes for output
 *   Common use: Writing text to files or network with charset control
 *
 * Modern File Operations (NIO.2):
 * - Files: Factory class for file operations
 *   Features: Atomic operations, exception handling, security checks
 *
 * - Paths: Factory class for file path manipulation
 *   Benefits: OS-independent path handling, resolution, normalization
 *
 * - FileChannel: High-performance file I/O
 *   Features: Memory-mapped files, file locking, direct transfers
 *
 * Data Buffering:
 * - StringBuilder: Mutable string container
 *   Alternative to String concatenation
 *
 * Character Sets:
 * - StandardCharsets: Standard character encodings
 *   Common options: UTF-8, UTF-16, ISO-8859-1
 *   Best practice: Always specify encoding explicitly
 */

// Java Imports
const HttpURLConnection = Java.type("java.net.HttpURLConnection");
const BufferedReader = Java.type("java.io.BufferedReader");
const InputStreamReader = Java.type("java.io.InputStreamReader");
const OutputStreamWriter = Java.type("java.io.OutputStreamWriter");
const StringBuilder = Java.type("java.lang.StringBuilder");
const Files = Java.type("java.nio.file.Files");
const Paths = Java.type("java.nio.file.Paths");
const FileChannel = Java.type("java.nio.channels.FileChannel");
const StandardOpenOption = Java.type("java.nio.file.StandardOpenOption");
const StandardCharsets = Java.type("java.nio.charset.StandardCharsets");
const JThread = Java.type("java.lang.Thread");
const MAX_RETRIES = 3;
const RETRY_DELAY = 6000;

/**
 * Asynchronous Function and Promise Handling
 *
 * 'async function' is a core feature of modern JavaScript for managing asynchronous operations.
 *
 * Key Concepts:
 * 1.  Async Keyword:
 *     - When a function is declared 'async', it automatically returns a Promise.
 *     - The Promise will resolve with whatever the function returns.
 *     - If the function throws an error, the Promise will be rejected with that error.
 *
 * 2.  Await Keyword:
 *     - Can only be used inside an 'async function'.
 *     - It pauses the execution of the async function until the Promise it is "awaiting" is settled (either resolved or rejected).
 *     - If the Promise resolves, 'await' returns the resolved value.
 *     - If the Promise is rejected, 'await' throws the rejection reason as an exception, which can be caught by a standard try/catch block.
 *
 * 3.  Event Loop:
 *     - 'await' does not block the entire JavaScript engine. It only pauses the current 'async' function.
 *     - It yields control back to the event loop, allowing other tasks (like UI updates in some environments, or other async operations) to run.
 *     - Once the awaited Promise settles, the function's execution is queued to resume where it left off.
 *
 * In this function, 'async' allows us to use 'await' for the network call, writing asynchronous code that reads like synchronous code.
 */
async function sendToAI(prompt, element, isReplacement = false, modelName) {
  let connection = null;
  console.log(
    "sendToAI invoked (prompt length:",
    prompt ? prompt.length : 0,
    ")"
  );
  try {
    // Get selected element
    const selectedElement = element || $(selection)[0];
    if (!selectedElement) {
      throw new Error("No element selected");
    }

    console.log("Processing element: " + selectedElement.name);

    /**
     * Network Connection Setup Using Java's HTTP Client API
     *
     * 1. URL Creation:
     *    - URL class parses and validates URL syntax
     *    - Handles various protocols (http, https, ftp, etc.)
     *    - Throws MalformedURLException for invalid URLs
     *
     * 2. Connection Establishment:
     *    - openConnection() creates a URLConnection instance
     *    - Actual network connection isn't made until needed
     *    - Connection pooling handled by underlying implementation
     *
     * 3. Timeout Configuration:
     *    - setConnectTimeout: Maximum time to establish TCP connection
     *    - setReadTimeout: Maximum time between data packets
     *    - Prevents resource exhaustion from hung connections
     *
     * 4. HTTP Method and Properties:
     *    - setRequestMethod: Sets HTTP verb (GET, POST, etc.)
     *    - setDoOutput: Enables writing to request body
     *    - Content-Type header indicates payload format
     */
    const url = new java.net.URL("http://localhost:11434/api/generate");
    connection = url.openConnection(); // Polymorphic - returns HttpURLConnection
    connection.setConnectTimeout(20000); // Network connection timeout (ms)
    connection.setReadTimeout(120000); // Data read timeout (ms) - Increased to 120s for longer prompts
    connection.setRequestMethod("POST"); // HTTP method specification
    connection.setDoOutput(true); // Enable request body writing
    connection.setRequestProperty("Content-Type", "application/json");

    // Prepare JSON request body. modelName may be provided by caller; fall back to existing default for compatibility.
    const body = JSON.stringify({
      model: modelName || "qwen2.5-coder:7b",
      prompt: prompt,
      stream: false, // Non-streaming mode for simpler response handling
    });

    /**
     * Output Stream Handling and Character Encoding
     *
     * Stream Hierarchy in Java I/O:
     * OutputStream (abstract, byte-oriented)
     * └─> Writer (abstract, character-oriented)
     *     └─> OutputStreamWriter (bridge from chars to bytes)
     *
     * Key Concepts:
     * 1. Character Encoding:
     *    - OutputStreamWriter converts chars to bytes
     *    - UTF-8 handles all Unicode characters
     *    - Default charset is platform-dependent (avoid!)
     *
     * 2. Stream Operations:
     *    - write(): Buffers data for writing
     *    - flush(): Forces buffered data to destination
     *    - close(): Releases system resources
     *
     * 3. Resource Management:
     *    - Always close streams in finally block
     *    - Or use try-with-resources (Java 7+)
     *    - Prevents resource leaks and data loss
     */
    const writer = new OutputStreamWriter(
      connection.getOutputStream(), // Raw byte output stream
      "UTF-8" // Explicit character encoding
    );
    writer.write(body); // Write characters to buffer
    writer.flush(); // Force buffer to network
    writer.close(); // Clean up resources

    /**
     * HTTP Response Processing and Error Handling
     *
     * HTTP Response Structure:
     * 1. Status Line:
     *    - Response code (200, 404, 500, etc.)
     *    - Protocol version
     *    - Status message
     *
     * 2. Headers:
     *    - Metadata about response
     *    - Content-Type, Content-Length, etc.
     *
     * 3. Body:
     *    - Actual content (success case)
     *    - Error details (error case)
     *
     * Stream Processing Pattern:
     * 1. Decorator Chain:
     *    Raw InputStream/ErrorStream
     *    └─> InputStreamReader (bytes to chars)
     *        └─> BufferedReader (efficient reading)
     *
     * 2. StringBuilder vs String:
     *    - Mutable character sequence
     *    - Avoids string concatenation overhead
     *    - Not synchronized (unlike StringBuffer)
     *
     * Error Handling Best Practices:
     * 1. Always check response code first
     * 2. Use appropriate error stream
     * 3. Properly close resources
     * 4. Handle character encoding
     */
    const responseCode = connection.getResponseCode(); // Synchronous call
    if (responseCode !== HttpURLConnection.HTTP_OK) {
      const errorReader = new BufferedReader(
        new InputStreamReader(connection.getErrorStream(), "UTF-8")
      );
      const errorBuilder = new StringBuilder();
      let line;
      while ((line = errorReader.readLine()) !== null) {
        errorBuilder.append(line);
      }
      errorReader.close();
      return "Error: HTTP " + responseCode + ": " + errorBuilder.toString();
    }

    // Read successful response with buffering for performance
    const reader = new BufferedReader(
      new InputStreamReader(connection.getInputStream(), "UTF-8") // Input stream with UTF-8 decoding
    );
    const responseBuilder = new StringBuilder(); // Efficient string accumulation
    let line;
    while ((line = reader.readLine()) !== null) {
      // Process response line by line
      responseBuilder.append(line); // Build complete response
    }
    reader.close(); // Release system resources

    // Parse response
    const responseJson = JSON.parse(responseBuilder.toString());
    if (!responseJson || !responseJson.response) {
      return "Error: No valid response from LLaMA";
    }

    const response = responseJson.response.trim();

    // Get view name
    let viewName = "UnknownView";
    if (selectedElement.type === "archimate-diagram-model") {
      viewName = selectedElement.name;
    } else {
      const theView = $(selection)
        .parents()
        .filter("archimate-diagram-model")
        .first();
      const viewView = [theView].flat()[0];
      if (viewView) {
        viewName = viewView.name;
      }
    }
    console.log("Creating documentation in view folder: " + viewName);

    /**
     * Path Resolution and Directory Creation Using NIO.2
     *
     * Utilizing Java NIO.2's path manipulation capabilities for robust file system operations:
     *
     * 1. Path Resolution:
     *    - Paths.get(): Creates Path instance from strings, handling OS-specific separators
     *    - resolve(): Combines paths while handling '..' and '.' segments automatically
     *    - replace(): Sanitizes view names by removing filesystem-unsafe characters
     *
     * 2. Directory Structure:
     *    /[workspace]
     *    └── documentation/
     *        └── [viewName]/
     *            └── ai_documentation.json
     *
     * 3. Safety Features:
     *    - Cross-platform path handling
     *    - Atomic directory creation
     *    - Race condition prevention
     */
    const basePath = Paths.get(__DIR__);
    const docsPath = basePath.resolve("documentation");
    const viewPath = docsPath.resolve(viewName.replace(/[<>:"/\\|?*]/g, "_"));
    const jsonPath = viewPath.resolve("ai_documentation.json");

    /**
     * Directory Creation with NIO.2
     *
     * Files.createDirectories() provides:
     * - Atomic creation of multiple directory levels
     * - Thread-safe operation
     * - Automatic handling of existing directories
     * - Permission inheritance from parent
     */
    Files.createDirectories(viewPath);

    /**
     * Timestamp Generation and Timezone Handling
     *
     * ISO-8601 Format Explanation:
     * YYYY-MM-DDThh:mm:ss.sss±hh:mm
     * where:
     * - YYYY: Full year (e.g., 2025)
     * - MM: Month (01-12)
     * - DD: Day (01-31)
     * - T: Time delimiter (literal 'T')
     * - hh: Hours (00-23)
     * - mm: Minutes (00-59)
     * - ss: Seconds (00-59)
     * - sss: Milliseconds (000-999)
     * - ±: Timezone direction (+ or -)
     * - hh:mm: Timezone offset
     *
     * Timezone Processing:
     * 1. getTimezoneOffset():
     *    - Returns minutes between UTC and local time
     *    - Negative for timezones ahead of UTC (e.g., Asia)
     *    - Positive for timezones behind UTC (e.g., Americas)
     *    - Example: IST (UTC+5:30) returns -330
     *
     * 2. Offset Conversion:
     *    - Invert sign for ISO format (opposite of getTimezoneOffset)
     *    - Split into hours and minutes
     *    - Format with proper sign and padding
     *
     * 3. Padding Function:
     *    - Ensures fixed width for numeric components
     *    - Maintains sortability of timestamps
     *    - Handles both positive and negative numbers
     */
    const now = new Date();
    const tzo = -now.getTimezoneOffset(); // Invert for ISO format
    const dif = tzo >= 0 ? "+" : "-"; // Determine timezone direction
    const pad = (num) => {
      const norm = Math.floor(Math.abs(num));
      return (norm < 10 ? "0" : "") + norm; // Zero-pad single digits
    };

    // Construct ISO-8601 timestamp with millisecond precision and timezone offset
    const localISOTime =
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) + // Month is 0-based, needs +1
      "-" +
      pad(now.getDate()) + // Day of month
      "T" + // ISO-8601 time separator
      pad(now.getHours()) + // 24-hour format
      ":" +
      pad(now.getMinutes()) + // Minutes
      ":" +
      pad(now.getSeconds()) + // Seconds
      "." +
      pad(now.getMilliseconds()) + // Millisecond precision
      dif + // Timezone direction
      pad(tzo / 60) + // Timezone hours
      ":" +
      pad(tzo % 60); // Timezone minutes

    const newEntry = {
      elementId: selectedElement.id,
      elementName: selectedElement.name,
      elementType: selectedElement.type,
      timestamp: localISOTime,
      content: response,
      isRTL: true,
      version: "2.0",
      viewName: viewName,
    };

    /**
     * JSON File Operations with NIO.2
     *
     * Implementation of atomic file operations using modern Java NIO.2 features:
     *
     * 1. File Existence Check:
     *    Files.exists() provides atomic verification of file presence
     *
     * 2. Byte-Level File Reading:
     *    - Files.readAllBytes(): Atomic read operation
     *    - Handles files up to 2GB (Integer.MAX_VALUE)
     *    - Automatically closes file resources
     *
     * 3. Character Encoding:
     *    - StandardCharsets.UTF_8: Unicode transformation format
     *    - BOM (Byte Order Mark) handling for cross-platform compatibility
     *    - Explicit charset specification prevents platform-dependent behavior
     */
    let entries = []; // Container for JSON entries
    if (Files.exists(jsonPath)) {
      // Atomic check for file existence
      try {
        const bytes = Files.readAllBytes(jsonPath); // Atomic read operation, returns byte[]
        const content = new java.lang.String(bytes, StandardCharsets.UTF_8); // Convert bytes to string with explicit charset
        // Handle UTF-8 BOM (EF BB BF) if present for cross-platform compatibility
        const jsonContent = content.startsWith("\uFEFF") // Check for BOM at start
          ? content.substring(1) // Skip BOM if present
          : content; // Use content as-is if no BOM
        entries = JSON.parse(jsonContent); // Parse UTF-8 string to JSON object

        if (!Array.isArray(entries)) {
          console.log("Warning: Invalid JSON format, resetting to empty array");
          entries = [];
        }
      } catch (error) {
        console.log("Error reading JSON: " + error);
        entries = [];
      }
    }

    // Remove old entry if replacement
    if (isReplacement) {
      entries = entries.filter(
        (entry) => entry.elementId !== selectedElement.id
      );
      console.log("Removed old entry for element: " + selectedElement.id);
    }

    // Add new entry
    entries.push(newEntry);

    // Sort entries by timestamp (newest first) using ISO-8601 compliant comparison
    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Natural chronological ordering

    /**
     * Advanced File I/O with NIO.2 FileChannel
     *
     * Evolution of File I/O in Java:
     * 1. Traditional I/O (java.io):
     *    - FileInputStream/FileOutputStream
     *    - Stream-based, blocking operations
     *    - Limited performance options
     *
     * 2. NIO Channels (java.nio):
     *    - FileChannel introduced
     *    - Buffer-oriented operations
     *    - Memory-mapped files support
     *
     * 3. NIO.2 Enhancements (java.nio.file):
     *    - Path abstraction
     *    - Atomic operations
     *    - Improved exception handling
     *
     * FileChannel Capabilities:
     * 1. High-Performance Features:
     *    - Direct buffer transfers (zero-copy)
     *    - Memory-mapped I/O
     *    - File locking for concurrent access
     *    - Position-based reading/writing
     *
     * 2. Buffer Operations:
     *    - ByteBuffer: Container for bytes
     *    - Heap vs Direct buffers
     *    - Bulk data transfers
     *
     * 3. Open Options (StandardOpenOption):
     *    CREATE           - Create new file if missing
     *    TRUNCATE_EXISTING- Clear existing content
     *    WRITE           - Enable write operations
     *    READ            - Enable read operations
     *    APPEND          - Write at end of file
     *
     * 4. Channel Synchronization:
     *    - force(boolean): Flushes to disk
     *    - metadata updates (true/false)
     *    - fsync vs fdatasync behavior
     *
     * 5. Resource Management:
     *    - Explicit close() required
     *    - try-with-resources recommended
     *    - System resource cleanup
     */
    const jsonContent = JSON.stringify(entries, null, 2);
    const channel = FileChannel.open(
      jsonPath,
      StandardOpenOption.CREATE,
      StandardOpenOption.TRUNCATE_EXISTING,
      StandardOpenOption.WRITE
    );

    try {
      // Write UTF-8 encoded content with native byte ordering
      channel.write(
        java.nio.ByteBuffer.wrap(jsonContent.getBytes(StandardCharsets.UTF_8)) // High-performance native buffer
      );
      channel.force(true); // Ensure data is written to disk
    } finally {
      channel.close(); // Release system resources
    }

    console.log(
      isReplacement ? "Entry replaced successfully" : "Entry added successfully"
    );

    return response;
  } catch (error) {
    console.log("Error in sendToAI: " + error);
    throw error; // Re-throw the error so the retryOperation can catch it
  } finally {
    if (connection) {
      try {
        connection.disconnect();
      } catch (error) {
        console.log("Error disconnecting: " + error);
      }
    }
  }
}

/**
 * Higher-Order Function for Retry Logic
 *
 * This 'async' function demonstrates a powerful pattern where a function takes another function as an argument.
 * 'retryOperation' is a higher-order function designed to add resilience to any asynchronous operation that might fail intermittently (e.g., network requests).
 *
 * @param {Function} operation - An async function (or a function that returns a Promise) to be executed.
 *
 * How it Works:
 * 1.  Asynchronous Loop: The 'for' loop runs up to MAX_RETRIES times. Because the function is 'async', we can use 'await' inside the loop.
 *
 * 2.  Try/Catch Block:
 *     - The 'try' block attempts to execute the provided 'operation' and 'await' its result.
 *     - If the operation succeeds, its result is returned, and the loop terminates.
 *
 * 3.  Error Handling and Retry Condition:
 *     - If 'await operation()' throws an error, the 'catch' block is executed.
 *     - It inspects the error message to see if it's a "retryable" error (in this case, a timeout).
 *     - The regular expression `/read...out/i` provides a flexible, case-insensitive way to match different timeout messages.
 *
 * 4.  Synchronous Delay with Java Threading:
 *     - `Thread.sleep(RETRY_DELAY)` is a blocking call. It pauses the execution of this specific asynchronous function.
 *     - In this context, it's a simple way to implement a delay between retries. While it blocks this part of the code, other asynchronous tasks managed by the event loop can still run.
 *     - This is a key example of interoperability, using a Java feature to achieve a goal within a JavaScript async function.
 *
 * 5.  Failure: If an error is not retryable, or if all retries are exhausted, the 'catch' block re-throws the error, causing the Promise returned by 'retryOperation' to be rejected.
 */
async function retryOperation(operation) {
  // operation is expected to be a function returning a Promise, e.g. () => sendToAI(...)
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation();
    } catch (error) {
      // Normalize error text for robust matching
      const raw =
        error && (error.message || error.toString())
          ? error.message || error.toString()
          : "";
      const msg = String(raw);
      console.log(
        `خطایی در تلاش مجدد برای مستندسازی توسط هوش مصنوعی رخ داده. (تلاش شمارۀ ${
          i + 1
        }): ${msg}`
      );

      // Retry on common timeout-like messages (case-insensitive): "read timed out", "read time out", "timed out", "connection timed out"
      const retryable =
        /read\s*tim(?:ed)?\s*out|read\s*time\s*out|timed\s*out|connection\s*tim(?:ed)?\s*out/i.test(
          msg
        );

      if (retryable && i < MAX_RETRIES - 1) {
        console.log(
          `تلاش برای مستندسازی ناموفق بود. تلاش ${
            i + 1
          } از ${MAX_RETRIES} — تکرار پس از ${RETRY_DELAY}ms`
        );
        JThread.sleep(RETRY_DELAY);
      } else {
        // Re-throw other errors immediately or if no retries left
        throw error;
      }
    }
  }
}

/**
 * Module Exports and Function Composition
 *
 * In Node.js-style modules (which jArchi scripting emulates), `module.exports` defines the public API of the file.
 *
 * This code uses a powerful functional programming concept: Function Composition.
 *
 * 1.  Exporting a Wrapper Function:
 *     - Instead of exporting 'sendToAI' or 'retryOperation' directly, we export a new anonymous function.
 *     - This function acts as a facade or a wrapper. Callers of this module will invoke this function.
 *
 * 2.  Closure:
 *     - The exported function takes the original arguments (`prompt`, `element`, `isReplacement`).
 *     - It then calls `retryOperation`. The argument it passes to `retryOperation` is another anonymous function:
 *     `() => sendToAI(...)`.
 *     - This inner function `() => sendToAI(...)` forms a closure. It "closes over" and remembers the
 *     `prompt`, `element`, and `isReplacement` variables from its parent scope.
 *
 * 3.  Decoupling and Reusability:
 *     - This pattern decouples the core logic (`sendToAI`) from the retry logic (`retryOperation`).
 *     - `retryOperation` is now a generic, reusable utility that could wrap *any* fallible async operation, not just
 *     `sendToAI`.
 *     - The caller of the module doesn't need to know about the retry mechanism; it's an implementation detail that is
 *     handled automatically.
 *     - This makes the API of this module simpler and more robust.
 */
// Exported wrapper: maintain backward compatibility but accept an optional 4th parameter 'modelName'.
module.exports = function (prompt, element, isReplacement, modelName) {
  console.log("AI wrapper invoked — delegating to retryOperation", modelName ? `model=${modelName}` : "(default model)");
  return retryOperation(() => sendToAI(prompt, element, isReplacement, modelName));
};
