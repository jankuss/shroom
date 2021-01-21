import * as readline from "readline";
import { Logger } from "./Logger";

export class ProgressBar implements Logger {
  private _count = 0;
  private _currentItem: string | undefined;

  constructor(
    private _logger: Logger,
    private _elementCount: number,
    private _getString: (
      current: number,
      count: number,
      extra?: string
    ) => string
  ) {
    this._update();
  }

  info(...args: string[]): void {
    process.stdout.write("\n");
    this._logger.info(...args);
  }

  debug(...args: string[]): void {
    process.stdout.write("\n");
    this._logger.debug(...args);
  }

  error(...args: string[]): void {
    process.stdout.write("\n");
    this._logger.error(...args);
  }

  log(...args: string[]): void {
    process.stdout.write("\n");
    this._logger.log(...args);
  }

  public increment(item: string) {
    this._currentItem = item;
    this._count++;
    this._update();
  }

  public done() {
    this._currentItem = undefined;
    this._update();
    process.stdout.write("\n");
  }

  private _update() {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    const baseText = this._getString(
      this._count,
      this._elementCount,
      this._currentItem
    );

    process.stdout.write(baseText);
  }
}
