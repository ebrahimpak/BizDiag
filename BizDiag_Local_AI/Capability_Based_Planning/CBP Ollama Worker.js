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
 * 'CBP Ollama Worker'
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
  const client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(5))
    .build();
  const apiRoot = "http://localhost:11434";
  const requestTimeoutMs = 120000;

  // Pump SWT events while the background HTTP future waits for Ollama.
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

  function send(method, path, body, timeoutMs, description) {
    const builder = HttpRequest.newBuilder(URI.create(apiRoot + path))
      .timeout(Duration.ofMillis(timeoutMs))
      .header("Content-Type", "application/json");
    if (method === "GET") {
      builder.GET();
    } else {
      builder.POST(HttpRequestBodyPublishers.ofString(
        JSON.stringify(body),
        StandardCharsets.UTF_8
      ));
    }
    const future = client.sendAsync(
      builder.build(),
      HttpResponseBodyHandlers.ofString(StandardCharsets.UTF_8)
    );
    return awaitResponse(future, timeoutMs, description);
  }

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
