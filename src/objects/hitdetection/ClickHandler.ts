import { IEventManagerEvent } from "../events/interfaces/IEventManagerEvent";
import { HitEventHandler } from "./HitSprite";

export class ClickHandler {
  private _doubleClickInfo?: {
    initialEvent: IEventManagerEvent;
    timeout: number;
  };

  private _map = new Map<string, boolean>();

  private _onClick: HitEventHandler | undefined;
  private _onDoubleClick: HitEventHandler | undefined;
  private _onPointerDown: HitEventHandler | undefined;
  private _onPointerUp: HitEventHandler | undefined;

  public get onClick() {
    return this._onClick;
  }

  public set onClick(value) {
    this._onClick = value;
  }

  public get onDoubleClick() {
    return this._onDoubleClick;
  }

  public set onDoubleClick(value) {
    this._onDoubleClick = value;
  }

  public get onPointerDown() {
    return this._onPointerDown;
  }

  public set onPointerDown(value) {
    this._onPointerDown = value;
  }

  public get onPointerUp() {
    return this._onPointerUp;
  }

  public set onPointerUp(value) {
    this._onPointerUp = value;
  }

  handleClick(event: IEventManagerEvent) {
    if (this._doubleClickInfo == null) {
      this.onClick && this.onClick(event);

      if (this.onDoubleClick != null) {
        this._startDoubleClick(event);
      }
    } else {
      event.stopPropagation();
      this._performDoubleClick(event);
    }
  }

  handlePointerDown(event: IEventManagerEvent) {
    this.onPointerDown && this.onPointerDown(event);
  }

  handlePointerUp(event: IEventManagerEvent) {
    this.onPointerUp && this.onPointerUp(event);
  }

  private _performDoubleClick(event: IEventManagerEvent) {
    if (this._doubleClickInfo == null) return;

    this.onDoubleClick &&
      this.onDoubleClick(this._doubleClickInfo.initialEvent);

    setTimeout(() => {
      this._resetDoubleClick();
    });
  }

  private _resetDoubleClick() {
    if (this._doubleClickInfo == null) return;

    clearTimeout(this._doubleClickInfo.timeout);
    this._doubleClickInfo = undefined;
  }

  private _startDoubleClick(event: IEventManagerEvent) {
    this._doubleClickInfo = {
      initialEvent: event,
      timeout: window.setTimeout(() => this._resetDoubleClick(), 350),
    };
  }
}
