import colors from "colors";

/** TODO: Better the structure of the logging */

type Logger = {
  critical: (mesasage: string) => void;
  warning: (mesasage: string) => void;
  success: (mesasage: string) => void;
};

export const logger: Logger = {
  critical: (message: string) => {
    console.log(colors.red.bold(message));
  },

  warning: (message: string) => {
    console.log(colors.bgYellow.bold(message));
  },

  success: (message: string) => {
    console.log(colors.cyan.bold(message));
  },
};
