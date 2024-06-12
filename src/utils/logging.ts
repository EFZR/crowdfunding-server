import colors from "colors";

/** TODO: Better the structure of the logging */

export function critical(message: string) {
  console.log(colors.red.bold(message));
}

export function warning(message: string) {
  console.log(colors.bgYellow.bold(message));
}

export function success(message: string) {
  console.log(colors.cyan.bold(message));
}
