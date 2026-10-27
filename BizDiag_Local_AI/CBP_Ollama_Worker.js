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
 * --------------------------------------------------------------------------------------------------------------------
 *
 * Shared local Ollama worker for the CBP continuation.
 * Provides a local worker for interacting with the Ollama API. It acts as a bridge between the Archi application and
 * the Ollama server, handling HTTP requests and responses, a RESTful API for model discovery and text generation. It
 * ensures that the Archi application can communicate with the Ollama server in a non-blocking manner, while also
 * providing error handling and timeout management.
 */

"use strict";

(function() {
  if (typeof globalThis.cbpOllamaWorker !== "undefined") return;

  const HttpClient = Java.type("java.net.http.HttpClient");
  const HttpRequest = Java.type("java.net.http.HttpRequest");
  const HttpRequestBodyPublishers = Java.type("java.net.http.HttpRequest$BodyPublishers");
  const HttpResponseBodyHandlers = Java.type("java.net.http.HttpResponse$BodyHandlers");
  const URI = Java.type("java.net.URI");
  const Duration = Java.type("java.time.Duration");
  const StandardCharsets = Java.type("java.nio.charset.StandardCharsets");
  const System = Java.type("java.lang.System");
  const Thread = Java.type("java.lang.Thread");
  const Display = Java.type("org.eclipse.swt.widgets.Display");
  const client = HttpClient.newBuilder() // Constructs an HttpClient instance we can use to make requests.
    .connectTimeout(Duration.ofSeconds(5))
    .build();
  const apiRoot = "http://localhost:11434";
  const requestTimeoutMs = 120000;

  /**
   * Waits for an asynchronous HTTP response while continuing to dispatch Archi's SWT events.
   *
   * The request future is cancelled if the display is unavailable, closes during the wait, or the
   * configured timeout (with a five-second scheduling allowance) expires. A heartbeat is logged
   * every 20 seconds so long-running local inference remains visible in the Archi console.
   *
   * @param {Object} future Java CompletableFuture returned by HttpClient.sendAsync().
   * @param {number} timeoutMs Maximum request wait in milliseconds, excluding the five-second allowance.
   * @param {string} description Human-readable operation name used in progress and error messages.
   * @returns {Object} Completed Java HTTP response.
   * @throws {Error} If the SWT display is unavailable/disposed, the request times out, or the future fails.
   */
  function awaitResponse(future, timeoutMs, description) {
    const display = Display.getCurrent();
    if (!display) {
      future.cancel(true);
      throw new Error("Could not find Archi's SWT display.");
    }

    const startedAt = System.currentTimeMillis();
    const deadline = startedAt + timeoutMs + 5000;
    let nextHeartbeat = startedAt + 20000;
    while (!future.isDone()) {
      if (display.isDisposed()) {
        future.cancel(true);
        throw new Error("Archi's SWT display was closed while " + description + ".");
      }
      const now = System.currentTimeMillis();
      if (now >= deadline) {
        future.cancel(true);
        throw new Error(description + " exceeded the " +
          Math.round(timeoutMs / 1000) + "-second timeout.");
      }
      if (now >= nextHeartbeat) {
        console.log("[AI] Still waiting for " + description + " (" +
          Math.round((now - startedAt) / 1000) + " seconds elapsed).");
        nextHeartbeat += 20000;
      }
      if (!display.readAndDispatch()) Thread.sleep(25);
    }

    try {
      return future.join();
    } catch (error) {
      const cause = error && typeof error.getCause === "function"
        ? error.getCause()
        : null;
      throw new Error(description + " failed: " +
        (cause ? String(cause.getMessage()) : String(error)));
    }
  }

  /**
   * Sends one JSON HTTP request to the local Ollama server and waits for its response.
   *
   * GET requests omit a body; every other method is sent as a UTF-8 JSON POST. The shared
   * asynchronous client and {@link awaitResponse} keep Archi's UI event loop responsive.
   * HTTP status validation and response-body parsing are left to the calling API operation.
   *
   * @param {string} method HTTP method; "GET" selects GET and other values select POST.
   * @param {string} path Ollama API path appended to the local API root.
   * @param {Object|null} body JSON-serializable request body for POST requests.
   * @param {number} timeoutMs Request timeout in milliseconds.
   * @param {string} description Human-readable operation name used for timeout and failure reporting.
   * @returns {Object} Java HTTP response with statusCode() and body() accessors.
   * @throws {Error} If request creation, waiting, or asynchronous HTTP execution fails.
   */
  function send(method, path, body, timeoutMs, description) {
    // Constructs a specific request to the Ollama server, with an HttpRequest instance.
    const builder = HttpRequest.newBuilder(URI.create(apiRoot + path))
      .timeout(Duration.ofMillis(timeoutMs)) // Sets a timeout for this request.
      .header("Content-Type", "application/json"); // Adds a given name value pair to the set of headers for this request.
    if (method === "GET") {
      builder.GET(); // Sets the request method of this builder to GET.
    } else {
      // Sets the request method of this builder to POST and sets its request body publisher to the given value.
      builder.POST(HttpRequestBodyPublishers.ofString(
        JSON.stringify(body),
        StandardCharsets.UTF_8
      ));
    }
    // sendAsync() returns a CompletableFuture wrapped around the HttpResponse.
    const future = client.sendAsync(
      builder.build(),
      HttpResponseBodyHandlers.ofString(StandardCharsets.UTF_8)
    );
    return awaitResponse(future, timeoutMs, description);
  }

  /**
   * Retrieves the installed Ollama model names for user selection.
   *
   * Calls GET /api/tags, requires HTTP 200, accepts either the `name` or `model` field
   * for each returned model, removes empty and duplicate names, and sorts case-insensitively.
   *
   * @returns {string[]} Available model tags, sorted alphabetically.
   * @throws {Error} If Ollama is unreachable, returns a non-200 status, invalid JSON, or no models.
   */
  function listModels() {
    // Use the server's live model list instead of shipping preferred model names.
    const response = send("GET", "/api/tags", null, 7000, "Ollama model discovery");
    if (response.statusCode() !== 200) {
      throw new Error("Ollama returned HTTP " + response.statusCode() +
        " while listing installed models.");
    }
    const payload = JSON.parse(String(response.body()));
    const names = (payload.models || []).map(function(item) {
      return item.name || item.model || "";
    }).filter(function(name, index, all) {
      return name.length > 0 && all.indexOf(name) === index;
    });
    names.sort(function(a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    if (names.length === 0) {
      throw new Error("Ollama is running, but no installed models were returned by /api/tags.");
    }
    return names;
  }

  /**
   * Requests one non-streaming JSON-formatted generation from a selected Ollama model.
   *
   * Uses deterministic temperature 0 and the supplied prediction-token limit (default 256).
   * The worker validates transport status and non-empty generated text but leaves interpretation
   * and validation of the returned JSON content to the caller.
   *
   * @param {string} prompt Evidence-based instruction and context sent to the model.
   * @param {string} model Installed Ollama model tag selected by the user.
   * @param {number} [maxTokens=256] Maximum generated tokens requested from Ollama.
   * @returns {{model: string, content: string}} Selected model tag and generated response text.
   * @throws {Error} If the model tag is empty, the request fails, Ollama returns a non-200 status,
   *   its response body is invalid JSON, or generated content is missing.
   */
  function request(prompt, model, maxTokens) {
    if (typeof model !== "string" || !model.trim()) {
      throw new Error("Choose an installed Ollama model before requesting assessments.");
    }
    // Non-streaming JSON keeps response parsing and validation predictable.
    const response = send("POST", "/api/generate", {
      model: model,
      prompt: prompt,
      stream: false,
      format: "json",
      options: {
        temperature: 0,
        num_predict: maxTokens || 256
      }
    }, requestTimeoutMs, "Ollama request for model '" + model + "'");
    if (response.statusCode() !== 200) {
      const errorText = String(response.body() || "");
      throw new Error("Ollama returned HTTP " + response.statusCode() + ": " +
        (errorText ? errorText.substring(0, 1200) : "empty error response"));
    }
    const payload = JSON.parse(String(response.body()));
    if (!payload || typeof payload.response !== "string" || !payload.response.trim()) {
      throw new Error("Ollama returned no generated response.");
    }
    return {
      model: model,
      content: payload.response
    };
  }

  globalThis.cbpOllamaWorker = Object.freeze({
    listModels: listModels,
    request: request
  });
})();
