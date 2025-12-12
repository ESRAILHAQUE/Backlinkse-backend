/**
 * Logger Utility
 * Provides consistent logging format across the application
 */

type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: unknown;
}

class Logger {
    private formatMessage(level: LogLevel, message: string, data?: unknown): string {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
        };

        if (data !== undefined && data !== null) {
            entry.data = data;
        }

        return JSON.stringify(entry, null, 2);
    }

    /**
     * Log informational messages
     */
    info(message: string, data?: unknown): void {
        console.log(this.formatMessage('info', message, data));
    }

    /**
     * Log error messages
     */
    error(message: string, error?: unknown): void {
        console.error(this.formatMessage('error', message, error));
    }

    /**
     * Log warning messages
     */
    warn(message: string, data?: unknown): void {
        console.warn(this.formatMessage('warn', message, data));
    }

    /**
     * Log debug messages
     */
    debug(message: string, data?: unknown): void {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.formatMessage('debug', message, data));
        }
    }
}

// Export singleton instance
export const logger = new Logger();

