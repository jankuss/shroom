import { HitEvent } from "../../interfaces/IHitDetection";
import { HitEventHandler } from "./HitSprite";

export class ClickHandler {
  private _doubleClickInfo?: {
    initialEvent: HitEvent;
    timeout: number;
  };

  private _didReceiveClick = false;

  private _onClick: HitEventHandler | undefined;
  private _onDoubleClick: HitEventHandler | undefined;

  private _clickTimeout: number | undefined;

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

  handleClick(event: HitEvent) {
    if (this._doubleClickInfo == null) {
      if (!this._didReceiveClick) {
        this._didReceiveClick = true;
        this.onClick && this.onClick(event);

        setTimeout(() => {
          this._didReceiveClick = false;
        });

        if (this.onDoubleClick != null) {
          this._startDoubleClick(event);
        }
      }
    } else {
      this._performDoubleClick(event);
    }
  }

  private _performDoubleClick(event: HitEvent) {
    if (this._doubleClickInfo == null) return;

    event.stopPropagation();
    this.onDoubleClick &&
      this.onDoubleClick(this._doubleClickInfo.initialEvent);
    this._resetDoubleClick();
  }

  private _resetDoubleClick() {
    if (this._doubleClickInfo == null) return;

    clearTimeout(this._doubleClickInfo.timeout);
    this._doubleClickInfo = undefined;
  }

  private _startDoubleClick(event: HitEvent) {
    event.stopPropagation();

    this._doubleClickInfo = {
      initialEvent: event,
      timeout: window.setTimeout(() => this._resetDoubleClick(), 350),
    };
  }
}
