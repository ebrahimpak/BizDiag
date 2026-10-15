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
 * ---------------------------------------------------------------------------------------------------------------------
 * H2JdbcProcessor_EN GUI is the English version of H2JdbcProcessor_FA
 *  This Java application processes the output from ArchiModelDumper.ajs jArchi script,
 * which attempts to export the entire active Archimate Model using the most basic,
 * fundamental JArchi global collections. The oputputs will be saved in an in-memory
 * Java file, the following Maven command should run this application:
 *
 * mvn "-DmainClass=ArchiJDBC.H2JdbcProcessor_EN" exec:java
 *
 */

package ArchiJDBC;
import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.Image;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.swing.Box;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSpinner;
import javax.swing.JSplitPane;
import javax.swing.JTable;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SpinnerNumberModel;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import javax.swing.table.DefaultTableModel;

import com.formdev.flatlaf.FlatLightLaf;

/**
 * Reads the archi_model_dump.json file and performs updates on an external
 * database using standard JDBC.
 *
 * This version is configured for the **H2 FILE DATABASE**.
 * Compilation and execution requires the H2 JDBC driver JAR to be on the
 * classpath.
 */

/*
 * Educational notes (terse):
 * - JDBC fundamentals: use DriverManager to obtain Connections,
 * PreparedStatement
 * to bind parameters and avoid SQL injection, and ResultSet to iterate rows.
 * - Resource management: prefer try-with-resources to ensure deterministic
 * closing
 * of JDBC resources and avoid connection leaks.
 * - Concurrency: Swing UI runs on the Event Dispatch Thread (EDT). Heavy I/O
 * work should run off the EDT — this program uses invokeLater for GUI creation
 * but runs DB operations on demand; consider background threads for long ops.
 * - LOB handling: CLOB/BLOB/SQLXML are streaming types; avoid calling
 * toString()
 * on JDBC LOB objects (it shows internal references). Read them explicitly.
 * - Parsing: a small recursive-descent parser is included — it trades
 * completeness
 * for zero-dependency portability. Understand its O(n) parsing behavior for
 * input
 * length n and its limited error reporting compared to a full JSON library.
 * - Type-safety: interacting with script engines and Java collections requires
 * runtime checks; prefer copying into well-typed structures rather than
 * unchecked casts.
 */
public class H2JdbcProcessor_EN {

    // --- CONFIGURATION ---
    // Load the dump produced by the AJS script in its ArchiSyncDump folder
    private static final String INPUT_FILE_PATH = "./ArchiSyncDump/archi_model_dump.json";

    // H2 FILE-BASED URL: Creates 'archi_external_sync.mv.db' in the current
    // directory.
    // DB_CLOSE_DELAY=-1 keeps the database open even if all connections close.
    private static final String DB_URL = "jdbc:h2:./archi_external_sync;DB_CLOSE_DELAY=-1";
    private static final String DB_USER = "sa"; // H2 Default User
    private static final String DB_PASS = "p@ssw0rd";

    public static void main(String[] args) {
        System.out.println("main() started... Now is GUI's turn...");
        FlatLightLaf.setup();
        System.out.println("Starting Archimate Model Data Processor [H2 Mode]...");
        // 1. Read JSON dump
        String jsonContent = readModelDump();
        if (jsonContent == null)
            return;

        // 2. Parse JSON and import into H2 table
        List<Map<String, Object>> concepts = parseJsonToConcepts(jsonContent);
        if (concepts == null) {
            System.err.println("Failed to parse JSON.");
            return;
        }

        System.out.printf("Parsed %d concepts from JSON. Importing into H2...\n", concepts.size());
        if (!importConceptsIntoH2(concepts)) {
            System.err.println("Failed to import concepts into H2.");
            return;
        }

        // 3. Launch Swing UI for querying the H2 DB
        SwingUtilities.invokeLater(() -> createAndShowGui());
    }

    /**
     * Parse the JSON string into a list of JsonObject representing concepts.
     */
    private static List<Map<String, Object>> parseJsonToConcepts(String jsonContent) {
        /*
         * Targeting Java 21+: do not depend on Nashorn or removed JDK script engines.
         * Use the bundled lightweight JSON parser for portability and zero
         * external dependencies. This keeps the runtime footprint minimal and
         * avoids relying on legacy APIs that were removed from recent JDKs.
         */
        try {
            return parseJsonWithBuiltin(jsonContent);
        } catch (Exception ex) {
            System.err.println("Builtin JSON parse error: " + ex);
            return null;
        }
    }

    /*
     * Simple built-in JSON parser (no external libraries). It handles arrays,
     * objects, strings, numbers, booleans and null. It's intentionally small but
     * enough for the Archi dump structure.
     */
    private static List<Map<String, Object>> parseJsonWithBuiltin(String s) throws Exception {
        JSONParser p = new JSONParser(s);
        Object res = p.parseValue();
        List<Map<String, Object>> converted = toListOfMaps(res);
        if (converted != null)
            return converted;
        throw new Exception("Unexpected root JSON type: " + (res == null ? "null" : res.getClass()));
    }

    /**
     * Convert an object into a List<Map<String,Object>> safely by checking element
     * types and copying entries. Returns null if the object cannot be converted.
     */
    private static List<Map<String, Object>> toListOfMaps(Object obj) {
        // Handle null input - return null if input is null
        if (obj == null)
            return null;

        // Case 1: Input is already a List - process each element
        if (obj instanceof List) {
            List<?> raw = (List<?>) obj;
            List<Map<String, Object>> out = new ArrayList<>();

            // Iterate through each item in the input list
            for (Object item : raw) {
                // Only process list elements that are Maps
                if (item instanceof Map) {
                    Map<?, ?> m = (Map<?, ?>) item;
                    // Create new LinkedHashMap to preserve insertion order
                    Map<String, Object> mm = new java.util.LinkedHashMap<>();
                    // Convert all keys to String and copy values
                    for (Map.Entry<?, ?> e : m.entrySet()) {
                        Object k = e.getKey();
                        // Ensure all keys are Strings using String.valueOf()
                        mm.put(String.valueOf(k), e.getValue());
                    }
                    out.add(mm);
                } else {
                    // Non-map element found; skip it
                    // This silently ignores non-Map elements in the list
                }
            }
            return out;
        }

        // Case 2: Input is a single Map - wrap it in a List
        if (obj instanceof Map) {
            Map<?, ?> m = (Map<?, ?>) obj;
            Map<String, Object> mm = new java.util.LinkedHashMap<>();
            for (Map.Entry<?, ?> e : m.entrySet()) {
                Object k = e.getKey();
                // Ensure all keys are Strings using String.valueOf()
                mm.put(String.valueOf(k), e.getValue());
            }
            // Create a single-element list containing the converted map
            List<Map<String, Object>> out = new ArrayList<>();
            out.add(mm);
            return out;
        }
        // Case 3: Input is neither List nor Map - return null
        return null;
    }

    // Minimal recursive-descent JSON parser
    private static class JSONParser {
        private final String s;
        private int i = 0;

        JSONParser(String s) {
            this.s = s;
        }

        /*
         * Lexical Analysis: Skip Whitespace
         * - Part of lexical analysis phase in parsing
         * - Advances cursor past whitespace characters
         * - Time Complexity: O(k) where k is whitespace length
         * - Common in recursive descent parsers for clean token handling
         */
        private void skipWs() {
            while (i < s.length()) {
                char c = s.charAt(i);
                if (c == ' ' || c == '\n' || c == '\r' || c == '\t' || c == '\f')
                    i++;
                else
                    break;
            }
        }

        Object parseValue() throws Exception {
            skipWs();
            if (i >= s.length())
                return null;
            char c = s.charAt(i);
            if (c == '{')
                return parseObject();
            if (c == '[')
                return parseArray();
            if (c == '"')
                return parseString();
            if (c == 't' || c == 'f' || c == 'n')
                return parseLiteral();
            return parseNumber();
        }

        // Parses a JSON object from { to } and returns it as a Map<String, Object>.
        Map<String, Object> parseObject() throws Exception {
            Map<String, Object> out = new java.util.LinkedHashMap<>();
            i++; // skip '{'
            skipWs();
            if (i < s.length() && s.charAt(i) == '}') { // If immediately finds }, returns empty map {}
                i++;
                return out;
            }
            while (i < s.length()) { // For each iteration: skips whitespace, parses the key as a string.
                skipWs();
                String key = parseString();
                skipWs();
                if (s.charAt(i) != ':') // Ensures there's a : after the key.
                    throw new Exception("Expected ':' at pos " + i);
                i++;
                Object val = parseValue(); // Recursively calls parseValue() to handle any type
                out.put(key, val); // Stores the key-value pair in the map

                skipWs();
                if (i >= s.length())
                    break;
                char c = s.charAt(i);
                if (c == ',') {
                    i++;
                    continue; // More key-value pairs coming
                }
                if (c == '}') {
                    i++;
                    break; // End of object
                }
                throw new Exception("Unexpected char in object at " + i + ": " + c);
            }
            return out;
        }

        List<Object> parseArray() throws Exception {
            List<Object> out = new ArrayList<>();
            i++; // skip '['
            skipWs();
            if (i < s.length() && s.charAt(i) == ']') {
                i++;
                return out;
            }
            while (i < s.length()) {
                Object val = parseValue();
                out.add(val);
                skipWs();
                if (i >= s.length())
                    break;
                char c = s.charAt(i);
                if (c == ',') {
                    i++;
                    continue;
                }
                if (c == ']') {
                    i++;
                    break;
                }
                throw new Exception("Unexpected char in array at " + i + ": " + c);
            }
            return out;
        }

        String parseString() throws Exception {
            if (s.charAt(i) != '"')
                throw new Exception("Expected string at " + i);
            i++; // skip '"'
            StringBuilder sb = new StringBuilder();
            while (i < s.length()) {
                char c = s.charAt(i++);
                if (c == '"')
                    break;
                if (c == '\\') {
                    if (i >= s.length())
                        break;
                    char e = s.charAt(i++);
                    switch (e) {
                        case '"' -> sb.append('"');
                        case '\\' -> sb.append('\\');
                        case '/' -> sb.append('/');
                        case 'b' -> sb.append('\b');
                        case 'f' -> sb.append('\f');
                        case 'n' -> sb.append('\n');
                        case 'r' -> sb.append('\r');
                        case 't' -> sb.append('\t');
                        case 'u' -> {
                            if (i + 3 >= s.length())
                                throw new Exception("Invalid unicode escape");
                            String hex = s.substring(i, i + 4);
                            sb.append((char) Integer.parseInt(hex, 16));
                            i += 4;
                        }
                        default -> sb.append(e);
                    }
                } else {
                    sb.append(c);
                }
            }
            return sb.toString();
        }

        Object parseNumber() throws Exception {
            int start = i;
            if (s.charAt(i) == '-')
                i++;
            while (i < s.length() && Character.isDigit(s.charAt(i)))
                i++;
            boolean isFloat = false;
            if (i < s.length() && s.charAt(i) == '.') {
                isFloat = true;
                i++;
                while (i < s.length() && Character.isDigit(s.charAt(i)))
                    i++;
            }
            if (i < s.length() && (s.charAt(i) == 'e' || s.charAt(i) == 'E')) {
                isFloat = true;
                i++;
                if (s.charAt(i) == '+' || s.charAt(i) == '-')
                    i++;
                while (i < s.length() && Character.isDigit(s.charAt(i)))
                    i++;
            }
            String num = s.substring(start, i);
            try {
                if (isFloat)
                    return Double.valueOf(num);
                else
                    return Long.valueOf(num);
            } catch (NumberFormatException ex) {
                throw new Exception("Invalid number: " + num);
            }
        }

        // A JSON literal parser method that parses the keywords true, false, and null
        Object parseLiteral() throws Exception {
            if (s.startsWith("true", i)) { // Checks if the substring starting at position i begins with "true".
                i += 4; // If yes: advances position by 4 characters (t,r,u,e)
                return Boolean.TRUE;
            }
            if (s.startsWith("false", i)) { // Checks for "false" starting at position i.
                i += 5; // If yes: advances position by 5 characters (f,a,l,s,e).
                return Boolean.FALSE;
            }
            if (s.startsWith("null", i)) { // Checks for "null" starting at position i.
                i += 4; // If yes: advances position by 4 characters (n,u,l,l).
                return null;
            }
            throw new Exception("Unknown literal at " + i);
        }
    }

    /**
     * Import the parsed concept objects into the H2 database table.
     */
    private static boolean importConceptsIntoH2(List<Map<String, Object>> concepts) {
        // Ensure H2 driver is available. Attempt to load the driver class so the
        // DriverManager will have a suitable driver. If the class is not found,
        // provide a clear error with an example classpath command for GraalVM.
        try {
            Class.forName("org.h2.Driver");
        } catch (ClassNotFoundException cnfe) {
            System.err.println("H2 JDBC driver class 'org.h2.Driver' not found on classpath.");
            System.err.println("Make sure the H2 jar is on the classpath when running the program.");
            System.err.println("E.g., [PowerShell]:");
            return false;
        }

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
            // Drop the table if it exists (single source of truth: current code schema)
            try (PreparedStatement drop = conn.prepareStatement("DROP TABLE IF EXISTS archi_concepts")) {
                drop.executeUpdate();
            }

            // Create table with correct schema
            try (PreparedStatement create = conn.prepareStatement(
                    "CREATE TABLE archi_concepts (" +
                            "id VARCHAR(255) PRIMARY KEY, name VARCHAR(1024), type VARCHAR(255), " +
                            "is_element BOOLEAN, is_view BOOLEAN, documentation CLOB, " +
                            "source_id VARCHAR(255), target_id VARCHAR(255), model_name VARCHAR(255), properties CLOB)")) {
                create.executeUpdate();
            }

            /**
             * Use MERGE to upsert by id (works in H2):
             * KEY(id): Specifies that the id column is used to determine if a row exists;
             * If no row with that id exists, a new one will be inserted.
             * VALUES (?,?,?,?,?,?,?,?,?): Prepared statement placeholders for the 9 values
             * So: This is an "upsert" (update + insert) operation that:
             * 1: Checks if a record with the given id exists
             * 2: If exists: Updates all the other columns for that id.
             * 3: If doesn't exist: Inserts a new record with all values.
             */
            final String SQL = "MERGE INTO archi_concepts (id,name,type,is_element,is_view,documentation,source_id,target_id,model_name,properties) KEY(id) VALUES (?,?,?,?,?,?,?,?,?,?)";
            try (PreparedStatement stmt = conn.prepareStatement(SQL)) {
                int batch = 0; // Counter to track how many statements are in the current batch.

                // Iterate through each concept object in the concepts collection.
                for (Map<String, Object> obj : concepts) {
                    String id = getStringSafe(obj, "id"); // Safely get id as string.
                    String properties = getStringSafe(obj, "properties");
                    stmt.setString(1, id); // Set 1st parameter: id
                    stmt.setString(2, getStringSafe(obj, "name")); // Set 2nd parameter: name.
                    stmt.setString(3, getStringSafe(obj, "type")); // Set 3rd parameter: type.

                    // Handle boolean is_element field with type safety.
                    boolean isElem = false; // Default value if not found or wrong type
                    Object isElemObj = obj.get("isElement");
                    if (isElemObj instanceof Boolean aBoolean) // Check if it's actually a Boolean.
                        isElem = aBoolean;

                    boolean isView = false;
                    Object isViewObj = obj.get("isView");
                    if (isViewObj instanceof Boolean aBoolean)
                        isView = aBoolean;

                    stmt.setBoolean(4, isElem); // Set 4th parameter: is_element
                    stmt.setBoolean(5, isView);
                    stmt.setString(6, getStringSafe(obj, "documentation"));// Set 5th: documentation.
                    stmt.setString(7, getStringSafe(obj, "sourceId")); // Set the 6th parameter: source_id
                    stmt.setString(8, getStringSafe(obj, "targetId")); // Set the 7th parameter: target_id
                    stmt.setString(9, getStringSafe(obj, "modelName"));// Set the 8th parameter: model_name
                    stmt.setString(10, getStringSafe(obj, "properties"));
                    /*
                     * After every placeholder has been set, the method addBatch() is called. All of
                     * the placeholder values are added to a group that will be sent to the database
                     * together. We can request the database to perform all of the updates at one
                     * time. This is called a batch update. In order to perform batch updates, we
                     * have to do two things. First, we have to create a batch, then we have to call
                     * the executeBatch() method. Creating a batch is accomplished by adding each
                     * PreparedStatement to the batch. It doesn't execute yet.
                     */
                    stmt.addBatch();
                    batch++; // Increment batch counter
                    if (batch % 500 == 0) // Execute batch every 500 records to avoid memory issues.
                        stmt.executeBatch(); // Send 500 statements to database at once.
                }
                if (batch % 500 != 0) // Execute any remaining statements that didn't make the 500-count batches.
                    stmt.executeBatch(); // Clean up final partial batch.
            }
            System.out.println("Import complete.");
            return true;
        } catch (SQLException e) {
            System.err.println("JDBC import error: " + e);
            e.printStackTrace(System.err);
            return false;
        }
    }

    /*
     * Defensive Programming: Safe Map Access Pattern
     * - Implements Null Object pattern for map access.
     * - Guards against: null maps, missing keys, non-string values
     * - Fail-safe design: returns null instead of throwing exceptions.
     * - Common in data integration where type/presence guarantees are weak.
     */
    private static String getStringSafe(Map<String, Object> obj, String key) {
        try {
            if (obj == null)
                return null;
            Object v = obj.get(key);
            if (v == null)
                return null;
            return v.toString();
        } catch (Exception e) {
            // ignore
        }
        return null;
    }

    private static JLabel createBottomRightIcon(String imagePath) {
        JLabel iconLabel = new JLabel();
        iconLabel.setHorizontalAlignment(SwingConstants.RIGHT);
        iconLabel.setVerticalAlignment(SwingConstants.BOTTOM);
        iconLabel.setBorder(javax.swing.BorderFactory.createEmptyBorder(0, 0, 0, 0));
        iconLabel.setOpaque(false);

        try {
            if (!Files.exists(Paths.get(imagePath))) {
                iconLabel.setText("BizDiag icon not found: " + imagePath");
                return iconLabel;
            }

            java.io.File imageFile = Paths.get(imagePath).toAbsolutePath().normalize().toFile();
            Image image = ImageIO.read(imageFile);
            if (image == null) {
                iconLabel.setText("BizDiag icon not found: " + imagePath);
                return iconLabel;
            }

            ImageIcon icon = new ImageIcon(image);
            iconLabel.setIcon(icon);
            iconLabel.setPreferredSize(new Dimension(icon.getIconWidth(), icon.getIconHeight()));
            iconLabel.setMinimumSize(new Dimension(icon.getIconWidth(), icon.getIconHeight()));
            iconLabel.setMaximumSize(new Dimension(icon.getIconWidth(), icon.getIconHeight()));
        } catch (IOException ex) {
            iconLabel.setText("Could not read image: " + imagePath);
            System.err.println("Image load failed: " + imagePath + " -> " + ex.getMessage());
        }

        return iconLabel;
    }

    /**
     * Build and display the Swing GUI with SQL input and results table.
     */
    private static void createAndShowGui() {
        JFrame frame = new JFrame("Archi Model Viewer with Database");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(1220, 710);
        frame.getContentPane().setLayout(new BorderLayout());

        JPanel topPanel = new JPanel();
        JTextField sqlField = new JTextField("SELECT * FROM archi_concepts LIMIT ?", 70);
        // Spinner for user to enter desired number of rows (replaces the '?'
        // placeholder)
        JSpinner rowSpinner = new JSpinner(new SpinnerNumberModel(100, 1, 100000, 100));
        JLabel rowsLabel = new JLabel("Rows:");
        JLabel sqlLabel = new JLabel("SQL Code:");
        JButton runBtn = new JButton("Run Query");
        JButton reloadBtn = new JButton("Reload JSON into Database");
        topPanel.add(sqlLabel);
        topPanel.add(sqlField);
        topPanel.add(rowsLabel);
        topPanel.add(rowSpinner);
        topPanel.add(runBtn);
        topPanel.add(reloadBtn);

        JTable table = new JTable();
        JScrollPane tableScroll = new JScrollPane(table);

        JTextArea logArea = new JTextArea(6, 80);
        logArea.setEditable(false);
        JScrollPane logScroll = new JScrollPane(logArea);

        JSplitPane split = new JSplitPane(JSplitPane.VERTICAL_SPLIT, tableScroll, logScroll);
        split.setResizeWeight(0.8);
        split.setDividerSize(0);
        split.setBorder(javax.swing.BorderFactory.createEmptyBorder());

        JLabel iconLabel = createBottomRightIcon("./img/labelPic_EN.png");
        if (iconLabel.getIcon() instanceof ImageIcon imageIcon) {
            frame.setIconImage(imageIcon.getImage());
        }

        JPanel iconPanel = new JPanel(new java.awt.FlowLayout(java.awt.FlowLayout.RIGHT, 0, 0));
        iconPanel.setOpaque(false);
        iconPanel.setBorder(javax.swing.BorderFactory.createEmptyBorder(0, 0, 0, 0));
        iconPanel.add(iconLabel);

        frame.getContentPane().add(topPanel, BorderLayout.NORTH);
        frame.getContentPane().add(split, BorderLayout.CENTER);
        frame.getContentPane().add(iconPanel, BorderLayout.SOUTH);

        runBtn.addActionListener(e -> {
            String sql = sqlField.getText();
            // If the SQL contains a single '?' placeholder, replace it with the
            // numeric value from the spinner. This keeps the SQL editable while
            // allowing a convenient row-count control.
            if (sql.contains("?")) {
                Object val = rowSpinner.getValue();
                /*
                 * 1st Method: This commented-out line is the laconic regex-based version:
                 * sql = sql.replaceFirst("\\?", String.valueOf(val));
                 *
                 * 2nd Method: in the Run button handler, detect ? and execute using a
                 * PreparedStatement there (pass spinner values), otherwise call the existing
                 * executeQueryAndFillTable that uses a Statement.
                 */
                try (Connection connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
                     PreparedStatement prestate = connection.prepareStatement(sql);) {
                    // Bind the first parameter to the spinner value (assumed numeric here)
                    if (val instanceof Number number) {
                        prestate.setInt(1, (number.intValue()));
                    } else {
                        prestate.setString(1, String.valueOf(val));
                    }
                    if (prestate.execute()) {
                        try (ResultSet rSet = prestate.getResultSet()) {
                            DefaultTableModel model = resultSetToTableModel(rSet);
                            table.setModel(model);
                            int rowCount = model.getRowCount();
                            logArea.append("Total rows displayed: " + rowCount + "\n");
                        }
                    } else {
                        int updateCount = prestate.getUpdateCount();
                        DefaultTableModel model = new DefaultTableModel();
                        model.addColumn("Result");
                        model.addRow(new Object[] { "Update count: " + updateCount });
                        table.setModel(model);
                    }
                    logArea.append("Executed command: " + prestate.toString() + "\n");
                } catch (SQLException ex) {
                    logArea.append("Error: " + ex + "\n");
                }
            } else {
                try {
                    executeQueryAndFillTable(sql, table);
                    logArea.append("Executed: " + sql + "\n");
                } catch (SQLException ex) {
                    logArea.append("Error: " + ex + "\n");
                }
            }
        });

        runBtn.addActionListener(e -> {
            try {
                rowSpinner.commitEdit();
            } catch (ParseException pex) {
                JOptionPane.showMessageDialog(frame, "Row count is invalid.");
            }
        });

        reloadBtn.addActionListener(e -> {
            String json = readModelDump();
            if (json == null) {
                JOptionPane.showMessageDialog(frame, "Could not read the JSON file.", "Error", JOptionPane.ERROR_MESSAGE);
                return;
            }
            List<Map<String, Object>> concepts = parseJsonToConcepts(json);
            if (concepts == null) {
                JOptionPane.showMessageDialog(frame, "Problem parsing the JSON file.", "Error", JOptionPane.ERROR_MESSAGE);
                return;
            }
            if (importConceptsIntoH2(concepts)) {
                JOptionPane.showMessageDialog(frame, "Reload completed successfully.", "Information", JOptionPane.INFORMATION_MESSAGE);
            } else {
                JOptionPane.showMessageDialog(frame, "Reload failed.", "Error", JOptionPane.ERROR_MESSAGE);
            }
        });

        frame.setVisible(true);
    }

    /**
     * Execute the given SQL and populate the JTable with the ResultSet if any.
     */
    /*
     * MVC Pattern Implementation for Database GUI
     * - Controller method bridging SQL (Model) and JTable (View)
     * - Uses Command pattern for SQL execution
     * - Resource management: try-with-resources for JDBC objects
     * - Handles both query (SELECT) and update (INSERT/UPDATE/DELETE) results
     * - Thread consideration: runs on EDT, consider background execution for large
     * results
     */
    private static void executeQueryAndFillTable(String sql, JTable table) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
            try (Statement stmt = conn.createStatement()) {
                boolean hasRs = stmt.execute(sql);
                if (hasRs) {
                    try (ResultSet rs = stmt.getResultSet()) {
                        DefaultTableModel model = resultSetToTableModel(rs);
                        table.setModel(model);
                    }
                } else {
                    int updateCount = stmt.getUpdateCount();
                    // If no ResultSet, show a simple one-row model with result info
                    DefaultTableModel model = new DefaultTableModel();
                    model.addColumn("Result");
                    model.addRow(new Object[] { "Update count: " + updateCount });
                    table.setModel(model);
                }
            }
        }
    }

    /*
     * Data Access Pattern: ResultSet to Presentation Model Conversion
     * - Implements Table Data Gateway pattern
     * - Dynamic column discovery via metadata
     * - Type-safe conversion of SQL types to Java types
     * - Handles special cases: CLOBs, BLOBs, XMLType
     * - Complexity: O(R*C) where R=rows, C=columns
     * - Memory: O(R*C) for full result materialization
     */
    private static DefaultTableModel resultSetToTableModel(ResultSet rs) throws SQLException {
        ResultSetMetaData md = rs.getMetaData();
        int cols = md.getColumnCount();
        String[] colNames = new String[cols];
        for (int i = 0; i < cols; i++)
            colNames[i] = md.getColumnLabel(i + 1);
        DefaultTableModel model = new DefaultTableModel(colNames, 0);
        while (rs.next()) {
            Object[] row = new Object[cols];
            for (int i = 0; i < cols; i++) {
                try {
                    Object val = rs.getObject(i + 1);
                    switch (val) {
                        case null -> row[i] = null;
                        case java.sql.Clob c -> row[i] = readClob(c); // for documentations
                        case java.sql.SQLXML sqlxml -> {
                            try {
                                row[i] = sqlxml.getString();
                            } catch (SQLException ex) {
                                row[i] = "<SQLXML: error reading>";
                            }
                        }
                        case java.sql.Blob blob -> {
                            try {
                                long len = blob.length();
                                row[i] = "<BLOB length=" + len + ">";
                            } catch (SQLException ex) {
                                row[i] = "<BLOB>";
                            }
                        }
                        default -> row[i] = val;
                    }
                } catch (SQLException ex) {
                    // If any odd JDBC implementation throws here, fall back to toString
                    try {
                        Object fallback = rs.getObject(i + 1);
                        row[i] = fallback == null ? null : fallback.toString();
                    } catch (SQLException ex2) {
                        row[i] = "<ERROR>";
                    }
                }
            }
            model.addRow(row);
        }
        return model;
    }

    /*
     * JDBC LOB Handling Strategy
     * - Two-phase CLOB reading with fallback:
     * 1. Fast path: direct substring if size < 2GB
     * 2. Streaming fallback: for large CLOBs or driver quirks
     * - Handles DB-specific CLOB implementations gracefully
     * - Memory efficient: streams large content instead of full load
     * - Buffer size (2048) chosen for typical text content patterns
     */
    private static String readClob(java.sql.Clob c) {
        if (c == null)
            return null;
        try {
            long len = c.length();
            // If length fits in int, use getSubString for simplicity
            if (len <= Integer.MAX_VALUE) {
                return c.getSubString(1, (int) len);
            }
        } catch (SQLException e) {
            // driver-specific behavior may throw SQLException here; ignore and try
            // streaming
        }
        // Fallback: stream the characters
        StringBuilder sb = new StringBuilder();
        try (java.io.Reader r = c.getCharacterStream()) {
            char[] buf = new char[2048];
            int n;
            while ((n = r.read(buf)) != -1) {
                sb.append(buf, 0, n);
            }
            return sb.toString();
        } catch (SQLException | IOException e) {
            return "<CLOB: error reading>";
        }
    }

    /**
     * Reads the entire JSON model dump file into a String.
     */
    private static String readModelDump() {
        try {
            System.out.printf("Attempting to read file: %s\n", INPUT_FILE_PATH);
            String content = Files.readString(Paths.get(INPUT_FILE_PATH));
            System.out.println("File read successfully. JSON file size: " + content.length() + " bytes.");
            return content;
        } catch (IOException e) {
            System.err.println("Fatal I/O error: unable to read file at " + INPUT_FILE_PATH + ".");
            System.err.println("Please ensure the file exists in the current directory.");
            return null;
        }
    }

}