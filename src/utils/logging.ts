import colors from "colors";

/** Improved Logger structure with enhanced flexibility and readability */

type LogLevel = 'critical' | 'warning' | 'success';

type LoggerConfig = {
  level: LogLevel;
  color: (message: string) => string;
};

type Logger = {
  log: (level: LogLevel, message: string) => void;
  critical: (message: string) => void;
  warning: (message: string) => void;
  success: (message: string) => void;
};

const logLevels: { [key in LogLevel]: LoggerConfig } = {
  critical: {
    level: 'critical',
    color: (message: string) => colors.red.bold(message),
  },
  warning: {
    level: 'warning',
    color: (message: string) => colors.bgYellow.bold(message),
  },
  success: {
    level: 'success',
    color: (message: string) => colors.cyan.bold(message),
  },
};

const logMessage = (level: LogLevel, message: string) => {
  console.log(logLevels[level].color(`[${level.toUpperCase()}] ${message}`));
};

export const logger: Logger = {
  log: (level: LogLevel, message: string) => {
    logMessage(level, message);
  },
  critical: (message: string) => {
    logMessage('critical', message);
  },
  warning: (message: string) => {
    logMessage('warning', message);
  },
  success: (message: string) => {
    logMessage('success', message);
  },
};
