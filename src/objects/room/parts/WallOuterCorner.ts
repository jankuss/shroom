import * as PIXI from "pixi.js";

import { IRoomPart } from "./IRoomPart";
import { RoomPartData } from "./RoomPartData";

export class WallOuterCorner extends PIXI.Container implements IRoomPart {
  private _borderWidth = 0;
  private _wallHeight = 0;
  private _roomZ = 0;
  private _wallTopColor = 0;

  constructor() {
    super();
  }

  public get roomZ() {
    return this._roomZ;
  }

  public set roomZ(value) {
    this._roomZ = value;
    this._update();
  }

  public get wallY() {
    return -this._wallHeight;
  }

  update(data: RoomPartData): void {
    this._borderWidth = data.borderWidth;
    this._wallHeight = data.wallHeight;
    this._wallTopColor = data.wallTopColor;
    this._update();
  }

  private _createTopSprite() {
    const border = new PIXI.TilingSprite(
      PIXI.Texture.WHITE,
      this._borderWidth,
      this._borderWidth
    );
    border.transform.setFromMatrix(new PIXI.Matrix(1, 0.5, 1, -0.5));
    border.tint = this._wallTopColor;
    border.x = -this._borderWidth;
    border.y =
      -this._wallHeight +
      this.roomZ * 32 -
      32 / 2 +
      this._borderWidth / 2 +
      (32 - this._borderWidth);
    return border;
  }

  private _update() {
    this.removeChildren();

    this.addChild(this._createTopSprite());
  }
}
