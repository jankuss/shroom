import { HitEvent } from "../interfaces/IHitDetection";
import { HitEventHandler } from "./hitdetection/HitSprite";

export class ClickHandler {
  private _doubleClickInfo?: {
    initialEvent: HitEvent;
    timeout: number;
  };

  private _onClick: HitEventHandler | undefined;
  private _onDoubleClick: HitEventHandler | undefined;

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

  private resetDoubleClick() {
    if (this._doubleClickInfo == null) return;

    clearTimeout(this._doubleClickInfo.timeout);
    this._doubleClickInfo = undefined;
  }

  private startDoubleClick(event: HitEvent) {
    this._doubleClickInfo = {
      initialEvent: event,
      timeout: window.setTimeout(() => this.resetDoubleClick(), 350),
    };
  }

  handleClick(event: HitEvent) {
    if (this.onClick != null || this.onDoubleClick != null) {
      event.stopPropagation();
    }

    if (this._doubleClickInfo == null) {
      this.onClick && this.onClick(event);
      this.startDoubleClick(event);
    } else {
      this.onDoubleClick &&
        this.onDoubleClick(this._doubleClickInfo.initialEvent);
      this.resetDoubleClick();
    }
  }
}
