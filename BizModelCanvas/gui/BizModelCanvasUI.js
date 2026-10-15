/**
 * BizModelCanvas GUI Utilities - Shared infrastructure for GUI operations
 * 
 * Provides:
 * - i18n (internationalization) message loading
 * - Console capture and streaming
 * - Script execution management
 * - Common UI helpers
 */

const BizCanvas = {
    
    // =========================== I18N Support ===========================
    
    messages: {},
    currentLanguage: 'en',
    
    /**
     * Load localization messages from properties file
     * @param {string} language - 'en' or 'fa'
     */
    loadMessages: function(language) {
        this.currentLanguage = language;
        const propertiesFile = language === 'fa' 
            ? __dirname + '/gui/i18n/fa.properties'
            : __dirname + '/gui/i18n/en.properties';
        
        // Try to load properties file
        try {
            const content = readFile(propertiesFile);
            if (content) {
                const lines = content.split('\n');
                lines.forEach(line => {
                    line = line.trim();
                    if (line && !line.startsWith('#')) {
                        const [key, ...values] = line.split('=');
                        if (key && values.length > 0) {
                            this.messages[key.trim()] = values.join('=').trim();
                        }
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load i18n messages: ' + e);
        }
    },
    
    /**
     * Get localized message
     * @param {string} key - Message key (e.g., 'btn.execute')
     * @param {string|array} args - Optional replacement arguments
     * @returns {string} Localized message
     */
    msg: function(key, args) {
        let message = this.messages[key] || key;
        
        // Handle argument replacement {0}, {1}, etc.
        if (args) {
            if (typeof args === 'string') {
                message = message.replace('{0}', args);
            } else if (Array.isArray(args)) {
                args.forEach((arg, index) => {
                    message = message.replace('{' + index + '}', arg);
                });
            }
        }
        
        return message;
    },
    
    // =========================== Console Capture ===========================
    
    consoleListeners: [],
    originalConsole: null,
    
    /**
     * Register a listener to receive console output
     * @param {function} callback - Called with (message, level) where level is 'log'|'error'|'warn'|'info'
     */
    addConsoleListener: function(callback) {
        this.consoleListeners.push(callback);
    },
    
    /**
     * Remove a console listener
     */
    removeConsoleListener: function(callback) {
        const index = this.consoleListeners.indexOf(callback);
        if (index >= 0) {
            this.consoleListeners.splice(index, 1);
        }
    },
    
    /**
     * Wrap console to capture output
     * Should be called before any scripts execute
     */
    wrapConsole: function() {
        if (this.originalConsole) return; // Already wrapped
        
        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
            clear: console.clear,
            show: console.show
        };
        
        const self = this;
        
        // Wrap log
        console.log = function() {
            const message = Array.from(arguments).join(' ');
            self.originalConsole.log.apply(console, arguments);
            self.consoleListeners.forEach(listener => {
                try {
                    listener(message, 'log');
                } catch (e) {
                    // Ignore listener errors
                }
            });
        };
        
        // Wrap error
        console.error = function() {
            const message = Array.from(arguments).join(' ');
            self.originalConsole.error.apply(console, arguments);
            self.consoleListeners.forEach(listener => {
                try {
                    listener(message, 'error');
                } catch (e) {
                    // Ignore listener errors
                }
            });
        };
        
        // Wrap warn
        console.warn = function() {
            const message = Array.from(arguments).join(' ');
            self.originalConsole.warn.apply(console, arguments);
            self.consoleListeners.forEach(listener => {
                try {
                    listener(message, 'warn');
                } catch (e) {
                    // Ignore listener errors
                }
            });
        };
        
        // Wrap info
        console.info = function() {
            const message = Array.from(arguments).join(' ');
            self.originalConsole.info.apply(console, arguments);
            self.consoleListeners.forEach(listener => {
                try {
                    listener(message, 'info');
                } catch (e) {
                    // Ignore listener errors
                }
            });
        };
    },
    
    /**
     * Restore original console
     */
    unwrapConsole: function() {
        if (this.originalConsole) {
            console.log = this.originalConsole.log;
            console.error = this.originalConsole.error;
            console.warn = this.originalConsole.warn;
            console.info = this.originalConsole.info;
            console.clear = this.originalConsole.clear;
            console.show = this.originalConsole.show;
            this.originalConsole = null;
        }
    },
    
    // =========================== Script Management ===========================
    
    scripts: {
        'analyze-vp': 'Analyze Model for Value Proposition.ajs',
        'cleanup-vp': 'Cleanup Value Propositions.ajs',
        'detect-duplicate': 'Detect Duplicate Value Propositions.ajs',
        'diagnose-vp': 'Diagnose Value Proposition Structure.ajs',
        'enhanced-view': 'Create Enhanced Value View.ajs',
        'convert-bmc': 'convertBMCtoArchiMate.ajs',
        'debug-view': 'Debug View and Model.ajs',
        'deep-intel': 'Deep Model Intelligence.ajs',
        'test-rel': 'Test Relationship Types.ajs'
    },
    
    scriptTabs: {
        'analysis': ['analyze-vp', 'cleanup-vp', 'detect-duplicate', 'diagnose-vp'],
        'views': ['enhanced-view', 'convert-bmc'],
        'utilities': ['debug-view', 'deep-intel', 'test-rel']
    },
    
    /**
     * Get script ID for a given script key
     */
    getScriptFile: function(scriptId) {
        return this.scripts[scriptId];
    },
    
    /**
     * Get all scripts organized by tab
     */
    getScriptsByTab: function() {
        return this.scriptTabs;
    },
    
    /**
     * Execute a script file
     * @param {string} scriptId - Script identifier (e.g., 'analyze-vp')
     * @param {function} onComplete - Callback when execution completes
     */
    executeScript: function(scriptId, onComplete) {
        if (!model) {
            if (onComplete) onComplete(false, 'No model is open');
            return;
        }
        
        const scriptFile = this.getScriptFile(scriptId);
        if (!scriptFile) {
            if (onComplete) onComplete(false, 'Script not found: ' + scriptId);
            return;
        }
        
        // Get the base directory where BizModelCanvas scripts are located
        const scriptPath = __dirname + '/' + scriptFile;
        
        try {
            // Verify file exists before loading
            try {
                const file = new java.io.File(scriptPath);
                if (!file.exists()) {
                    if (onComplete) onComplete(false, 'Script file not found: ' + scriptPath);
                    return;
                }
            } catch (fileCheckError) {
                if (onComplete) onComplete(false, 'Cannot access script file: ' + fileCheckError);
                return;
            }
            
            // Load and execute the script
            load(scriptPath);
            if (onComplete) onComplete(true, null);
            
        } catch (e) {
            const errorMsg = (e.toString ? e.toString() : String(e)) + 
                           ' (Script: ' + scriptFile + ')';
            if (onComplete) onComplete(false, errorMsg);
        }
    },
    
    // =========================== Utility Functions ===========================
    
    /**
     * Check if a model is open and valid
     */
    isModelOpen: function() {
        return typeof model !== 'undefined' && model !== null;
    },
    
    /**
     * Format a date/time string
     */
    formatTime: function(date) {
        if (!date) date = new Date();
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        return h + ':' + m + ':' + s;
    }
};

// Helper function to read file (if not already defined in jArchi)
if (typeof readFile === 'undefined') {
    const Files = Java.type('java.nio.file.Files');
    const Paths = Java.type('java.nio.file.Paths');
    const StandardCharsets = Java.type('java.nio.charset.StandardCharsets');
    
    readFile = function(filePath) {
        try {
            const path = Paths.get(filePath);
            if (Files.exists(path)) {
                return Files.readString(path, StandardCharsets.UTF_8);
            }
        } catch (e) {
            return null;
        }
    };
}

// Get the base directory (scripts folder)
if (typeof __dirname === 'undefined') {
    const currentFile = new java.io.File('.').getAbsolutePath();
    __dirname = currentFile;
}
