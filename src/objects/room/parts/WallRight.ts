import { WallLeft, WallProps } from "./WallLeft";

export class WallRight extends WallLeft {
  constructor(props: WallProps) {
    super(props);
  }

  _update() {
    this._offsets = { x: this._wallWidth, y: 0 };
    this.scale.x = -1;

    const left = this._wallLeftColor;
    this._wallLeftColor = this._wallRightColor;
    this._wallRightColor = left;

    super._update();
  }
}
