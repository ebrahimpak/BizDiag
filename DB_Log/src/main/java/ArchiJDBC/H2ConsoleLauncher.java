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
 * ---------------------------------------------------------------------------------------------------------------------
 * Author: Ebrahim Pak
 * > JDBC URL: jdbc:h2:./archi_external_sync;DB_CLOSE_DELAY=-1
 * > Username: sa
 * > Password: p@ssw0rd
 * This application lists every table in the H2 database output. This application runs the H2 database and opens the H2
 * console in a web browser, receiving the set credentials, and displaying the SQL quesry result, or any other operation
 * through the H2 database console.
 *
 * H2 Database JDBC URL, and Database Credentials:
 * > JDBC URL: jdbc:h2:./archi_external_sync;DB_CLOSE_DELAY=-1
 * > Username: sa
 * > Password: p@ssw0rd
 *
 * Checking out the Table name by SQL:
 * SELECT TABLE_NAME
 * FROM INFORMATION_SCHEMA.TABLES
 * WHERE TABLE_SCHEMA = 'PUBLIC';
 *
 */

package ArchiJDBC;

import java.awt.Desktop;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.h2.tools.Server;

public class H2ConsoleLauncher {
    private static final Logger LOGGER = Logger.getLogger(H2ConsoleLauncher.class.getName());

    public static void main(String[] args) {
        try {
            System.out.println("Starting embedded H2 web console...");
            Server server = Server.createWebServer(
                    "-web",
                    "-webAllowOthers",
                    "-webPort",
                    "8082"
            );
            server.start();
            System.out.println("H2 Console URL: " + server.getURL());

            String baseUrl = "http://localhost:8082/";
            String jdbcUrl = "jdbc:h2:./archi_external_sync;DB_CLOSE_DELAY=-1";
            String user = "sa";
            String password = "p@ssw0rd";

            openBrowserWithAutoLogin(baseUrl, jdbcUrl, user, password);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unable to start H2 console.", e);
        }
    }

    // WORKFLOW: (1) Get jsessionid from H2 → (2) Create HTML form with credentials
    // → (3) Open HTML in browser → (4) Form auto-submits with jsessionid + credentials
    private static void openBrowserWithAutoLogin(String baseUrl,
                                                 String jdbcUrl,
                                                 String user,
                                                 String password) throws Exception {

        System.out.println("Loading page and extracting jsessionid...");
        String rootUrl = baseUrl + (baseUrl.endsWith("/") ? "" : "/");
        // STEP 1: Fetch H2's initial page and extract the session token
        String jsessionid = getLoginActionUrl(baseUrl);
        
        if (jsessionid == null) {
            System.out.println("ERROR: Could not extract jsessionid. Unable to proceed.");
            return;
        }
        
        System.out.println("jsessionid: " + jsessionid);
        System.out.println("Creating auto-submit HTML page...");
        
        // STEP 2: Generate an HTML page with embedded form + auto-submit JavaScript
        // The form will POST all credentials to H2's login.do endpoint WITH the jsessionid token
        String tempHtmlPath = createAutoSubmitPage(rootUrl, jsessionid, jdbcUrl, user, password);
        
        System.out.println("Opening browser to temp page: " + tempHtmlPath);
        // STEP 3: Open the HTML in browers → browser runs the auto-submit script
        // The script sets JSESSIONID cookie and submits the form to login.do?jsessionid=XXX
        if (Desktop.isDesktopSupported()) {
            Desktop.getDesktop().browse(new File(tempHtmlPath).toURI());
        } else {
            System.out.println("Open manually: file:///" + tempHtmlPath.replace("\\", "/"));
        }
    }
    
    // Generate HTML with hidden form that auto-submits on page load
    private static String createAutoSubmitPage(String rootUrl, String jsessionid,
                                              String jdbcUrl, String user, String password) throws Exception {
        // Write HTML to temp directory so browser can access it
        String tempDir = System.getProperty("java.io.tmpdir");
        if (!tempDir.endsWith(File.separator)) {
            tempDir += File.separator;
        }
        // Generate unique filename with timestamp to bust browser cache
        String timestamp = String.valueOf(System.currentTimeMillis());
        String htmlFile = tempDir + "h2_autosubmit_" + timestamp + ".html";

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n");
        html.append("<head>\n");
        html.append("  <title>H2 Console Auto-Login</title>\n");
        html.append("  <meta http-equiv=\"Cache-Control\" content=\"no-cache, no-store, must-revalidate\" />\n");
        html.append("  <meta http-equiv=\"Pragma\" content=\"no-cache\" />\n");
        html.append("  <meta http-equiv=\"Expires\" content=\"0\" />\n");
        html.append("</head>\n");
        html.append("<body>\n");
        html.append("  <h1>Logging into H2 Console...</h1>\n");
        html.append("  <p>Please wait while we submit your credentials...</p>\n");
        html.append("  \n");
        // KEY: Form posts to login.do?jsessionid=XXX with the session token in the URL
        // H2 uses jsessionid to identify this browser's session context when validating credentials
        // Add timestamp to form action to bust any H2 console-side caches
        // Do NOT use target="_blank" - form should submit in current window to redirect to H2 console
        html.append("  <form id=\"loginForm\" method=\"POST\" action=\"").append(rootUrl).append("login.do?jsessionid=").append(jsessionid).append("&t=").append(timestamp).append("\">\n");
        html.append("    <input type=\"hidden\" name=\"url\" value=\"").append(escapeHtml(jdbcUrl)).append("\">\n");
        html.append("    <input type=\"hidden\" name=\"user\" value=\"").append(escapeHtml(user)).append("\">\n");
        html.append("    <input type=\"hidden\" name=\"password\" value=\"").append(escapeHtml(password)).append("\">\n");
        html.append("    <input type=\"hidden\" name=\"driver\" value=\"org.h2.Driver\">\n");
        html.append("  </form>\n");
        html.append("  \n");
        html.append("  <script type=\"text/javascript\">\n");
        html.append("    // Set JSESSIONID cookie so browser carries session token in all requests\n");
        html.append("    // Without this, H2 server won't recognize subsequent requests as authenticated\n");
        html.append("    document.cookie = 'JSESSIONID=").append(jsessionid).append("; path=/; secure=false';\n");
        html.append("    // Auto-submit form immediately on page load\n");
        html.append("    // Browser sends POST with jsessionid in URL + credentials in body\n");
        html.append("    document.getElementById('loginForm').submit();\n");
        html.append("  </script>\n");
        html.append("</body>\n");
        html.append("</html>\n");
        
        try (java.io.FileWriter writer = new java.io.FileWriter(htmlFile)) {
            writer.write(html.toString());
        }
        System.out.println("Created HTML file at: " + htmlFile);
        return htmlFile;
    }
    
    private static String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                  .replace("<", "&lt;")
                  .replace(">", "&gt;") 
                  .replace("\"", "&quot;")
                  .replace("'", "&#39;");
    }

    // STEP 1: Extract jsessionid from H2's initial response
    // H2 DOES NOT return an HTML login form on first request.
    // Instead, it returns a page with JavaScript redirect: location.href = 'login.jsp?jsessionid=XXXXX'
    // We extract XXXXX so we can reuse it in our own form submission.
    private static String getLoginActionUrl(String baseUrl) throws Exception {
        String rootUrl = baseUrl + (baseUrl.endsWith("/") ? "" : "/");
        System.out.println("Getting login action from: " + rootUrl);
        HttpURLConnection conn = (HttpURLConnection) new URI(rootUrl).toURL().openConnection();
        conn.setRequestMethod("GET");
        conn.setInstanceFollowRedirects(false); // Don't follow; we need to see the raw response with redirect

        String body = readResponse(conn);
        conn.disconnect();

        // Parse: location.href = 'login.jsp?jsessionid=XXXXX'
        // The regex extracts everything between the quotes after location.href =
        Pattern pattern = Pattern.compile("location\\.href\\s*=\\s*['\"]([^'\"]+)['\"]");
        Matcher matcher = pattern.matcher(body);
        if (matcher.find()) {
            String redirectUrl = matcher.group(1);
            System.out.println("Found JavaScript redirect: " + redirectUrl);
            // Now extract just the jsessionid value from the redirectUrl
            if (redirectUrl.contains("jsessionid=")) {
                // Extract jsessionid value using regex: jsessionid=([^&'"]*)
                // This captures the token between jsessionid= and the next &, ', or "
                Pattern sessionPattern = Pattern.compile("jsessionid=([^&'\"]*)");
                Matcher sessionMatcher = sessionPattern.matcher(redirectUrl);
                if (sessionMatcher.find()) {
                    String jsessionid = sessionMatcher.group(1);
                    System.out.println("Extracted jsessionid: " + jsessionid);
                    return jsessionid;
                }
            }
        }
        
        // Fallback: return null if no jsessionid found
        System.out.println("Warning: Could not extract jsessionid from initial page");
        return null;
    }

    private static String readResponse(HttpURLConnection conn) throws Exception {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append('\n');
            }
            return sb.toString();
        }
    }
}