/**
 * nio_interop_client.js
 *
 * GraalJS NIO client for the BizDiag NIO interoperability example.
 *
 * BizDiag — Intelligent Enterprise Architecture & Digital Strategy Automation
 * Copyright © 2026 Ebrahim Pak
 *
 * This file is part of BizDiag.
 *
 * BizDiag is free software distributed under the CeCILL-B Free Software License.
 * See the LICENSE file in the project root for the full license text.
 *
 * SPDX-License-Identifier: CECILL-B

@author Ebrahim Pak
 */

// --- Java Imports ---
const IOException = Java.type("java.io.IOException");
const InetSocketAddress = Java.type("java.net.InetSocketAddress");
const SocketChannel = Java.type("java.nio.channels.SocketChannel");
const ByteBuffer = Java.type("java.nio.ByteBuffer");
const Base64 = Java.type("java.util.Base64");
const JavaString = Java.type("java.lang.String");

// --- Configuration ---
// Default TCP port used by the BizDiag NIO interoperability server.
// The port can be overridden by the first argument supplied through host.arguments. If no port argument is supplied,
// this value is used.
const DEFAULT_PORT = 9999;

// NioInteropLauncher exposes the arguments supplied to the Java
// launcher as the Polyglot binding "host.arguments". The launcher receives:
// args[0] = path of this JavaScript client
// args[1] = TCP port
// args[2] = Base64-encoded JSON payload
// However, NioInteropLauncher removes the JavaScript file path before exporting the remaining arguments to GraalJS.

function main(args) {

  // Use an empty array if no arguments were supplied. const hostArgs = args || [];
  const hostArgs = args || [];

  // Read the TCP port from the first script argument.
  // parseInt(..., 10) explicitly interprets the argument as a decimal integer.
  // If the port argument is absent, use:
  const port = hostArgs.length > 0 ? parseInt(hostArgs[0], 10) : DEFAULT_PORT;

  // This client is intended to be launched by log_click.ajs through NioInteropLauncher, rather than executed as a
  // standalone GraalJS script without arguments.
  const encodedPayload = hostArgs.length > 1 ? hostArgs[1] : null;

  if (!encodedPayload) {
    console.error("[CLIENT FATAL] Missing encoded payload.");
    console.error("This client must be launched by log_click.ajs via NioInteropLauncher.");
    throw new Error("Missing encoded payload.");
  }

  let payloadBytes;

  // --- Decode and Inspect Payload ---
  try {
    // Decode the Base64 command-line argument into the original Java byte array. log_click.ajs originally encoded the
    // JSON text as UTF-8 bytes before applying Base64 encoding. Decoding therefore restores those bytes.
    payloadBytes = Base64.getDecoder().decode(encodedPayload);

    // Convert Java byte array to JavaScript string using JavaString constructor
    const payload = new JavaString(payloadBytes, "UTF-8");

    console.log("Payload received from log_click.ajs:");
    console.log(payload);
  } catch (e) {
    console.error("[CLIENT FATAL] Invalid Base64 payload: " + e);
    throw e;
  }

  // It is initialized to null so that the finally block can determine whether a channel was successfully created and
  // still needs closing.
  let sc = null;

  try {
    const addr = new InetSocketAddress("localhost", port);
    console.log(`Attempting connection to localhost:${port}...`);

    // SocketChannel.open() creates the channel, after which connect() establishes TCP connection to the specified server.
    sc = SocketChannel.open();
    sc.connect(addr);

    console.log("Connection successful. Sending payload.");

    // No additional encoding is performed here: these are the same UTF-8 bytes obtained after Base64 decoding.
    const data = ByteBuffer.wrap(payloadBytes);

    // SocketChannel.write() is allowed to write fewer bytes than are currently available in the buffer. Therefore,
    // continue writing until the buffer has no remaining bytes.
    while (data.hasRemaining()) sc.write(data);

    console.log("Payload sent successfully.");
  } catch (e) {
    if (e instanceof IOException) {
      console.error("Client I/O error (Is the server running?): " + e.getMessage());
    } else {
      console.error("An unexpected error occurred:", e);
    }
    throw e;
  } finally {

    // Always close the SocketChannel after the operation finishes. The channel is checked for both null and open state
    // because an exception may occur before SocketChannel.open() succeeds. Closing the channel releases the underlying
    // TCP connection and associated operating-system resources.

    if (sc && sc.isOpen()) sc.close();
  }
}

// --- Polyglot Argument Import ---
// NioInteropLauncher.java uses the GraalVM Polyglot API to expose the Java launcher arguments under the binding:
// host.arguments
// The launcher receives the Java command-line arguments as:
//      NioInteropLauncher <script.js> [arguments...]
//
//      args[0] = path of this JavaScript client
//      args[1] = TCP port
//      args[2] = Base64-encoded JSON payload
//
// It uses args[0] as the JavaScript file to execute and passes the remaining arguments to GraalJS as host.arguments.
// Consequently, this client receives:
//
//      host.arguments[0] = TCP port
//      host.arguments[1] = Base64-encoded JSON payload
//
// It imports the arguments and starts the client.
const hostArgs = Polyglot.import("host.arguments") || [];
main(hostArgs);
