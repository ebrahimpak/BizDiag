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
 * nio_interop_client.js
 * version 2.0
 *
 * This is a standalone GraalJS Network Client.
 * It runs outside Archi, which previously in version 1.0, used to be executed by 'js.exe, but now it runs by Apache
 * Maven's 'pom.xml'.
 * Role: Decodes Base64 payload, connects to the server, and transmits data. So the user doesn't need direct interaction
 * with this file.
 *
 */

// --- 1. Java Imports ---
const IOException = Java.type("java.io.IOException");
const InetSocketAddress = Java.type("java.net.InetSocketAddress");
const SocketChannel = Java.type("java.nio.channels.SocketChannel");
const ByteBuffer = Java.type("java.nio.ByteBuffer");
const Charset = Java.type("java.nio.charset.Charset");
const Base64 = Java.type("java.util.Base64"); // For decoding
const String = Java.type("java.lang.String");
const System = Java.type("java.lang.System"); // For getting property and exiting

// --- 2. Constants ---
const DEFAULT_PORT = 9999;
const encoder = Charset.forName("UTF-8").newEncoder();

// --- 3. Core Logic (Sending) ---
/**
 * Attempts to connect to the server and send a string of data.
 * @param {string} dataToSend - The decoded JSON payload string.
 * @param {number} port - The server port
 */
function sendData(dataToSend, port = DEFAULT_PORT) {
  // Use the encoder to directly convert the JS string to bytes,
  // and put them into a buffer. This is the safest way to convert a string for NIO.
  const CharBuffer = Java.type("java.nio.CharBuffer");
  const charBuffer = CharBuffer.wrap(dataToSend); // Wrap the JS string in a CharBuffer

  // Allocate a ByteBuffer large enough for the data
  const byteBuffer = ByteBuffer.allocate(charBuffer.length());

  // Use the encoder to perform the conversion
  encoder.encode(charBuffer, byteBuffer, true);
  byteBuffer.flip(); // Prepare the buffer for writing to the socket

  let sc = null; // SocketChannel reference

  try {
    const addr = new InetSocketAddress("localhost", port);
    console.log(`[CLIENT] Sending data to localhost:${port}...`);

    sc = SocketChannel.open();
    sc.socket().connect(addr, 5000); // 5 second timeout

    console.log(`[CLIENT] Connected. Sending data...`);

    // Write the data to the channel
    while (byteBuffer.hasRemaining()) {
      sc.write(byteBuffer);
    }
    console.log("[CLIENT] Data sent successfully.");
  } catch (e) {
    if (e instanceof IOException) {
      console.error(
        "[CLIENT ERROR] I/O error (Is the server running?): " + e.getMessage()
      );
    } else {
      console.error(
        "[CLIENT ERROR] An unexpected error occurred:",
        e.toString()
      );
    }
    System.exit(1); // Exit with failure code
  } finally {
    if (sc && sc.isOpen()) {
      try {
        sc.close();
      } catch (e) {
        /* ignore */
      }
    }
  }
}
// --- 4. Application Entry Point (Receiving and Decoding) ---

/**
 * The main function called by the js.exe launcher.
 */
function main() {
  // CRITICAL: Retrieve the Base64 encoded string from the System Property
  const encodedData = System.getProperty("payload.data");

  if (encodedData) {
    try {
      const decoder = Base64.getDecoder();
      const decodedBytes = decoder.decode(encodedData);

      // Convert decoded bytes back to a standard JavaScript string (JSON)
      const dataToSend = new String(decodedBytes, "UTF-8").toString();

      sendData(dataToSend);
    } catch (e) {
      console.error(
        "[CLIENT ERROR] Failed to decode Base64 payload:",
        e.toString()
      );
      System.exit(1);
    }
  } else {
    console.error(
      "[CLIENT ERROR] No data payload received via System Property."
    );
    System.exit(1);
  }
}

main();
