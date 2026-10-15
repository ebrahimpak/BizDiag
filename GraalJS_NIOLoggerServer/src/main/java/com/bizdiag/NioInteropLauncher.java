/**
 *  NioInteropLauncher.java
 *  This is a lightweight Java launcher for executing GraalJS scripts through the GraalVM Polyglot API, with support for
 *  passing arguments to the script.
 *  This Java launcher passes command-line arguments to GraalJS through the `host.arguments` binding.
 *
 *  The overall architecture of this application is like this:
 *
 *  log_click.ajs
 *     ↓ Runtime.exec(commandArray)
 *  java ... NioInteropLauncher nio_interop_client.js 9999 <Base64Payload>
 *     ↓
 *  NioInteropLauncher
 *     ↓
 *  host.arguments = ["9999", "<Base64Payload>"]
 *     ↓
 *  nio_interop_client.js
 *
 *
 * Therefore, the launcher's argument are as follow:
 *
 *   args[0] → nio_interop_client.js → the GraalJS script to execute
 *   args[1] → 9999 → passed to JS as host.arguments[0]
 *   args[2] → encoded payload → passed to JS as host.arguments[1]
 *
 *  --------------------------------------------------------------------------
 *
 *  This file is part of BizDiag software-suite.
 *  BizDiag — Intelligent Enterprise Architecture & Digital Strategy Automation
 *
 *  Copyright © 2026 Ebrahim Pak
 *
 *  BizDiag is free software distributed under the CeCILL-B Free Software License.
 *  See the LICENSE file in the project root for the full license text.
 *  SPDX-License-Identifier: CECILL-B
 *  @author Ebrahim Pak
 */

package com.bizdiag;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Source;
import java.nio.file.Path;
import java.util.Arrays;

public class NioInteropLauncher {
    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.err.println("Usage: GraalJsLauncher <script.js> [arguments...]");
            System.exit(1);
        }

        Path script = Path.of(args[0]).toAbsolutePath().normalize();
        String[] scriptArgs = Arrays.copyOfRange(args, 1, args.length);

        try (Context context = Context.newBuilder("js")
                .allowAllAccess(true)
                .build()) {
            context.getPolyglotBindings().putMember("host.arguments", scriptArgs);
            context.eval(Source.newBuilder("js", script.toFile()).build());
        }
    }
}