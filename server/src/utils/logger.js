/**
 * Logger utility for consistent logging across the application
 * Used by middleware and controllers
 */

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

export const logger = {
  /**
   * Info level log
   */
  info: (prefix, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logStr = `[${timestamp}] ${colors.blue}${prefix}${colors.reset} ${message}`;
    console.log(logStr, data || "");
  },

  /**
   * Success level log
   */
  success: (prefix, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logStr = `[${timestamp}] ${colors.green}${prefix}${colors.reset} ${message}`;
    console.log(logStr, data || "");
  },

  /**
   * Warning level log
   */
  warn: (prefix, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logStr = `[${timestamp}] ${colors.yellow}${prefix}${colors.reset} ${message}`;
    console.warn(logStr, data || "");
  },

  /**
   * Error level log
   */
  error: (prefix, message, error = null) => {
    const timestamp = new Date().toISOString();
    const logStr = `[${timestamp}] ${colors.red}${prefix}${colors.reset} ${message}`;
    console.error(logStr, error || "");
  },

  /**
   * Debug log (only in development)
   */
  debug: (prefix, message, data = null) => {
    if (process.env.NODE_ENV === "development") {
      const timestamp = new Date().toISOString();
      const logStr = `[${timestamp}] ${colors.cyan}[DEBUG] ${prefix}${colors.reset} ${message}`;
      console.log(logStr, data || "");
    }
  },
};

export default logger;
