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
 * nio_interop_server.js
 *
 * A non-blocking NIO server implemented from GraalJS.
 * The server listens for TCP connections and, when a client connects,
 * writes a single 64-bit timestamp (milliseconds since epoch) and
 * then closes the socket. The implementation uses Java NIO (ServerSocketChannel,
 * Selector, ByteBuffer) via GraalVM's Java interop.
 *
 * Notes:
 * - This GraalJs program demonstrates how to use `ServerSocketChannel` and `Selector` for scalable, non-blocking server
 *   designs (single-threaded readiness notification).
 * - It shows how to prepare binary payloads using `ByteBuffer` and the importance of `flip()` / `clear()` when
 *   switching between writing and reading modes.
 * - This template uses a shared direct buffer and immediately closes connections — appropriate for a simple demo, but
 *   real servers should manage per-connection state and avoid global mutable buffers that could race under concurrency.
 *
 */

const InetSocketAddress = Java.type("java.net.InetSocketAddress");
const ServerSocketChannel = Java.type("java.nio.channels.ServerSocketChannel");
const Selector = Java.type("java.nio.channels.Selector");
const SelectionKey = Java.type("java.nio.channels.SelectionKey");
const ByteBuffer = Java.type("java.nio.ByteBuffer");

function startServer(port = 9999) {
  console.log(`Server starting ... listening on port ${port}`);

  // Open the ServerSocketChannel and bind to the requested port.
  const ssc = ServerSocketChannel.open();
  ssc.socket().bind(new InetSocketAddress(port));

  // Configure non-blocking mode so we can use a Selector for readiness
  // notification rather than having a thread block on accept().
  ssc.configureBlocking(false);

  // Open a selector and register the server socket for ACCEPT events.
  const selector = Selector.open();
  ssc.register(selector, SelectionKey.OP_ACCEPT);

  // Single 8-byte direct buffer used to prepare the timestamp payload.
  // For this simple demo we reuse the buffer for each accepted connection.
  // In a real-world server you'd likely allocate per-connection buffers
  // or use a pool to avoid contention and to handle partial writes.
  const buffer = ByteBuffer.allocateDirect(8);

  // Main event loop: wait for channel readiness notifications.
  // `selector.select()` blocks until at least one channel is ready.
  while (true) {
    if (selector.select() === 0) continue;

    // Iterate selected keys (channels that are ready for an operation).
    const selectedKeys = selector.selectedKeys().iterator();
    while (selectedKeys.hasNext()) {
      const key = selectedKeys.next();

      // When the key is acceptable, a client is attempting to connect.

      if (key.isAcceptable()) {
        const sc = key.channel().accept();

        if (sc) {
          sc.configureBlocking(false);

          // Each accepted client gets its own input buffer.
          const clientBuffer = ByteBuffer.allocate(8192);

          // Register the client for incoming data.
          sc.register(selector, SelectionKey.OP_READ, clientBuffer);

          console.log("Client connected; waiting for payload.");
        }
      } else if (key.isReadable()) {
        const sc = key.channel();
        const clientBuffer = key.attachment();

        let bytesRead;

        try {
          bytesRead = sc.read(clientBuffer);
        } catch (e) {
          console.error("Client read error:", e);
          sc.close();
          continue;
        }

        if (bytesRead === -1) {
          // The client closed its output stream.
          clientBuffer.flip();

          const bytes = Java.type("java.util.Arrays")
              .copyOf(clientBuffer.array(), clientBuffer.remaining());

          const payload = new (Java.type("java.lang.String"))(
              bytes,
              "UTF-8"
          );

          console.log("Received payload: " + payload);
          sc.close();
        } else if (!clientBuffer.hasRemaining()) {
          console.error("Payload exceeded the 8192-byte buffer limit.");
          sc.close();
        }
      }


      // It's important to remove the processed key from the selected set
      // or it will be processed again on the next `select()`.
      selectedKeys.remove();
    }
  }
}

function run() {
  try {
    startServer();
  } catch (e) {
    // Minimal error handling for the demo. A production server should
    // attempt graceful shutdown, resource cleanup, and more detailed logs.
    console.log("Error:", e);
  }
}

/*
 * Entry point for GraalJS execution. `host.arguments` can be used to
 * pass the desired port if the embedding provides it. Example:
 * `js --jvm nio_interop_server.js 9999`
 */
const hostArgs = Polyglot.import("host.arguments") || [];
run(hostArgs);

/*
 * Advanced Network-Programming Foundations (server-centric notes)
 * ---------------------------------------------------------------
 * The section below expands on server-side networking foundations
 * and operational patterns that go beyond the simple demo.
 *
 * 1) Scalability models
 *    - Thread-per-connection: simple to reason about, but expensive
 *      when connections scale to thousands due to thread and stack
 *      memory overhead.
 *    - Event-driven (reactor/proactor): single or few threads handle
 *      thousands of connections using non-blocking I/O and readiness
 *      notifications (Selectors, epoll, kqueue). This is the model used
 *      in the example.
 *    - Asynchronous I/O (OS-level AIO or language runtimes with async
 *      APIs) can avoid explicit selectors and allow different scheduling
 *      models.
 *
 * 2) Selector semantics and caveats
 *    - Selectors are level-triggered in Java's NIO; you must manage
 *      interest ops and consume readiness events correctly to avoid
 *      busy loops or missed notifications.
 *    - Attach per-connection state to SelectionKeys to maintain read/write
 *      buffers and protocol parsers without global mutable state.
 *
 * 3) Partial writes and backpressure
 *    - A write may transfer only a subset of bytes; robust servers must
 *      detect `buffer.hasRemaining()` and register interest in OP_WRITE
 *      until the buffer drains, thereby applying backpressure to the
 *      application.
 *    - Backpressure prevents unbounded buffering in the server when
 *      clients are slow or congested.
 *
 * 4) Zero-copy and efficient I/O
 *    - Use `FileChannel.transferTo/transferFrom` and OS-specific
 *      facilities (sendfile) for zero-copy when serving files.
 *    - For small messages, pooling small direct ByteBuffers reduces
 *      allocation cost and GC churn.
 *
 * 5) Listening backlog, SO_REUSEADDR, and port behavior
 *    - The backlog parameter and `SO_REUSEADDR` affect how the OS
 *      handles connection queues, restarts, and address reuse. Test
 *      behavior under rapid restarts and heavy connection bursts.
 *
 * 6) Graceful shutdown and resource cleanup
 *    - Close server sockets, drain in-flight requests, and signal
 *      clients before termination; use timeouts for forced shutdown.
 *    - Monitor file descriptor usage and use health checks to avoid
 *      overloading the process.
 *
 * 7) Observability and testing
 *    - Add metrics for accept rate, active connections, write failures,
 *      and protocol errors. Add end-to-end tests simulating partial
 *      reads/writes, slow clients, and abrupt disconnects.
 *
 * 8) Security and robustness
 *    - Validate and limit incoming requests, consider TLS termination
 *      strategies, and be mindful of side-channel and resource-exhaustion
 *      attacks.
 *
 * 9) Protocol evolution and compatibility
 *    - Design versioned protocols, use length-prefixing or self-describing
 *      formats, and include schema evolution strategies to support rolling
 *      upgrades in distributed systems.
 *
 * These notes are intentionally concise but point to the core areas a
 * systems engineer must master when moving from toy examples to
 * production-grade network services.
 */
