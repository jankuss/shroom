import * as PIXI from "pixi.js";
import { IRoomPart } from "./IRoomPart";
import { RoomPartData } from "./RoomPartData";

export class WallLeft extends PIXI.Container implements IRoomPart {
  protected _offsets: { x: number; y: number } = { x: 0, y: 0 };

  protected _borderWidth = 0;
  protected _wallHeight = 0;
  protected _wallWidth = 32;
  protected _tileHeight = 0;

  private _drawHitArea = true;
  private _hideBorder = false;
  private _roomZ = 0;

  constructor(
    private props: {
      hideBorder: boolean;
      onMouseMove: (event: { offsetX: number; offsetY: number }) => void;
    }
  ) {
    super();

    this._hideBorder = props.hideBorder;
    //this._update();
  }

  public get roomZ() {
    return this._roomZ;
  }

  public set roomZ(value) {
    this._roomZ = value;
    this._update();
  }

  update(data: RoomPartData): void {
    this._borderWidth = data.borderWidth;
    this._wallHeight = data.wallHeight - this.roomZ * 32;
    this._tileHeight = data.tileHeight;

    this._update();
  }

  protected _update() {
    this.removeChildren();

    const hitArea = new PIXI.Polygon([
      new PIXI.Point(
        this._getOffsetX() + this._borderWidth,
        this._wallWidth / 2
      ),
      new PIXI.Point(
        this._getOffsetX() + this._borderWidth + this._wallWidth,
        0
      ),
      new PIXI.Point(
        this._getOffsetX() + this._borderWidth + this._wallWidth,
        -this._wallHeight
      ),
      new PIXI.Point(
        this._getOffsetX() + this._borderWidth,
        -this._wallHeight + this._wallWidth / 2
      ),
    ]);

    this.hitArea = hitArea;

    const primary = this._createPrimarySprite();
    const border = this._createBorderSprite();
    const top = this._createTopSprite();

    this.addChild(primary);

    if (!this._hideBorder) {
      this.addChild(border);
    }

    this.addChild(top);

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x111111);
    graphics.drawPolygon(hitArea);
    graphics.alpha = this._drawHitArea ? 1 : 0;
    graphics.endFill();

    graphics.addListener("mousemove", (event) => {
      if (event.target === graphics) {
        const position = event.data.getLocalPosition(graphics);
        this.props.onMouseMove({ offsetX: position.x, offsetY: position.y });
      }
    });
    graphics.interactive = true;

    this.addChild(graphics);
  }

  private _getOffsetX() {
    return this.scale.x * this._offsets.x;
  }

  private _createPrimarySprite() {
    const sprite = new PIXI.TilingSprite(
      PIXI.Texture.WHITE,
      this._wallWidth,
      this._wallHeight
    );
    sprite.transform.setFromMatrix(new PIXI.Matrix(-1, 0.5, 0, 1));
    sprite.x = this._getOffsetX() + this._borderWidth + this._wallWidth;
    sprite.y = -this._wallHeight;

    return sprite;
  }

  private _createBorderSprite() {
    const border = new PIXI.TilingSprite(
      PIXI.Texture.WHITE,
      this._borderWidth,
      this._wallHeight + this._tileHeight
    );
    border.transform.setFromMatrix(new PIXI.Matrix(-1, -0.5, 0, 1));
    border.tint = 0xcccccc;
    border.y = -this._wallHeight + this._wallWidth / 2;
    border.x = this._getOffsetX() + this._borderWidth;

    return border;
  }

  private _createTopSprite() {
    const border = new PIXI.TilingSprite(
      PIXI.Texture.WHITE,
      this._borderWidth,
      this._wallWidth
    );
    border.transform.setFromMatrix(new PIXI.Matrix(1, 0.5, 1, -0.5));
    border.tint = 0x888888;
    border.x = this._getOffsetX() + 0;
    border.y = -this._wallHeight + this._wallWidth / 2 - this._borderWidth / 2;

    return border;
  }
}
