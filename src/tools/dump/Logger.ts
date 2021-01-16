export interface Logger {
  info(...args: string[]): void;
  debug(...args: string[]): void;
  error(...args: string[]): void;
  log(...args: string[]): void;
}
