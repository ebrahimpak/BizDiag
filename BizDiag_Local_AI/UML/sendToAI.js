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
 * sendToAI.js — calls the locally-installed LLaMA3.1:latest API
 * This model could be replaced with any other locally-installed AI model of your choice.
 *
 * Version 1.0
 *
 */

(function() {
  "use strict";

  // Guard against double-loading in GraalJS
  if (typeof globalThis !== "undefined" && typeof globalThis.sendToAI !== "undefined") {
    return;
  }

  // Java Imports
  const URL = Java.type("java.net.URL");
  const HttpURLConnection = Java.type("java.net.HttpURLConnection");
  const BufferedReader = Java.type("java.io.BufferedReader");
  const InputStreamReader = Java.type("java.io.InputStreamReader");
  const OutputStreamWriter = Java.type("java.io.OutputStreamWriter");
  const StringBuilder = Java.type("java.lang.StringBuilder");

  // AI Model Selection Option: accepts optional modelName (string). If modelName is omitted the request will not
  // include a model field (safer fallback). Returns the assistant content string on success, or null on failures so
  // callers can detect and handle Ollama unavailability.
  function sendToAI(prompt, modelName) {
    const url = new URL("http://localhost:11434/v1/chat/completions");
    const connection = url.openConnection();
    connection.setRequestMethod("POST");
    connection.setDoOutput(true);
    connection.setRequestProperty("Content-Type", "application/json");

    const bodyObj = {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    };
    if (modelName) {
      bodyObj.model = modelName;
    }

    const body = JSON.stringify(bodyObj);

    try {
      const writer = new OutputStreamWriter(connection.getOutputStream(), "UTF-8");
      writer.write(body);
      writer.close();
    } catch (e) {
      // Unable to write request (likely connection issue)
      return null;
    }

    let responseCode;
    try {
      responseCode = connection.getResponseCode();
    } catch (e) {
      return null;
    }

    if (responseCode !== HttpURLConnection.HTTP_OK) {
      return null;
    }

    const reader = new BufferedReader(
      new InputStreamReader(connection.getInputStream(), "UTF-8")
    );
    const responseBuilder = new StringBuilder();
    let line;
    while ((line = reader.readLine()) !== null) {
      responseBuilder.append(line);
    }
    reader.close();

    const rawJson = responseBuilder.toString();
    const cleanedJson = String(rawJson)
      .replace(/^[\u200E\u200F\uFEFF\u2060\u00A0]+/, "")
      .trim();

    try {
      const responseJson = JSON.parse(cleanedJson);
      if (responseJson.choices && responseJson.choices.length > 0) {
        return responseJson.choices[0].message.content;
      }
    } catch (e) {
      return null;
    }

    return null;
  }

  if (typeof globalThis !== "undefined") {
    globalThis.sendToAI = sendToAI;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = sendToAI;
  }
})();
