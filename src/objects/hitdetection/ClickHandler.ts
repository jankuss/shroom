import { HitEvent } from "../../interfaces/IHitDetection";
import { HitEventHandler } from "./HitSprite";

export class ClickHandler {
  public static readonly CLICK = "click";
  public static readonly POINTER_DOWN = "pointerdown";
  public static readonly POINTER_UP = "pointerup";

  private _doubleClickInfo?: {
    initialEvent: HitEvent;
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

  handleClick(event: HitEvent) {
    if (this._canHandleEvent(ClickHandler.CLICK)) {
      this._beginEvent(ClickHandler.CLICK);

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
  }

  handlePointerDown(event: HitEvent) {
    if (!this._canHandleEvent(ClickHandler.POINTER_DOWN)) return;
    this._beginEvent(ClickHandler.POINTER_DOWN);

    this.onPointerDown && this.onPointerDown(event);
  }

  handlePointerUp(event: HitEvent) {
    if (!this._canHandleEvent(ClickHandler.POINTER_UP)) return;
    this._beginEvent(ClickHandler.POINTER_UP);

    this.onPointerUp && this.onPointerUp(event);
  }

  private _beginEvent(name: string) {
    this._map.set(name, false);
    setTimeout(() => {
      this._map.delete(name);
    });
  }

  private _canHandleEvent(name: string) {
    return this._map.get(name) ?? true;
  }

  private _performDoubleClick(event: HitEvent) {
    if (this._doubleClickInfo == null) return;
    if (event.target !== this._doubleClickInfo.initialEvent.target) return;

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

  private _startDoubleClick(event: HitEvent) {
    this._doubleClickInfo = {
      initialEvent: event,
      timeout: window.setTimeout(() => this._resetDoubleClick(), 350),
    };
  }
}
