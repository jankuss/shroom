import { WallLeft } from "./WallLeft";

export class WallRight extends WallLeft {
  constructor(props: {
    hideBorder: boolean;
    onMouseMove: (event: { offsetX: number; offsetY: number }) => void;
  }) {
    super(props);
  }

  _update() {
    this._offsets = { x: this._borderWidth + this._wallWidth, y: 0 };
    this.scale.x = -1;

    super._update();
  }
}
