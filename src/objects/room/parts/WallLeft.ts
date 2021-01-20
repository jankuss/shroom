import * as PIXI from "pixi.js";
import { IRoomPart } from "./IRoomPart";
import { RoomPartData } from "./RoomPartData";

export class WallLeft extends PIXI.Container implements IRoomPart {
  protected _offsets: { x: number; y: number } = { x: 0, y: 0 };

  protected _borderWidth = 0;
  protected _wallHeight = 0;
  protected _wallWidth = 32;
  protected _tileHeight = 0;
  protected _wallLeftColor = 0;
  protected _wallRightColor = 0;
  protected _wallTopColor = 0;
  protected _wallTexture: PIXI.Texture | undefined;

  private _drawHitArea = false;
  private _hideBorder = false;
  private _roomZ = 0;

  private _hitAreaElement: PIXI.DisplayObject | undefined;

  constructor(private props: WallProps) {
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

  private get wallY() {
    return -this._wallHeight;
  }

  private get wallHeight() {
    if (this.props.cutawayHeight != null) {
      return this._wallHeight - this.props.cutawayHeight;
    }

    return this._wallHeight;
  }

  update(data: RoomPartData): void {
    this._borderWidth = data.borderWidth;
    this._wallHeight = data.wallHeight - this.roomZ * 32;
    this._tileHeight = data.tileHeight;
    this._wallLeftColor = data.wallLeftColor;
    this._wallRightColor = data.wallRightColor;
    this._wallTopColor = data.wallTopColor;
    this._wallTexture = data.wallTexture;

    this._update();
  }

  protected _update() {
    if (this._hitAreaElement != null) {
      this.props.hitAreaContainer.removeChild(this._hitAreaElement);
      this._hitAreaElement = undefined;
    }

    this.removeChildren();

    const hitArea = new PIXI.Polygon([
      new PIXI.Point(
        this._getOffsetX() + this._borderWidth,
        this._wallWidth / 2 - (this.props.cutawayHeight ?? 0)
      ),
      new PIXI.Point(
        this._getOffsetX() + this._wallWidth + this._borderWidth,
        -(this.props.cutawayHeight ?? 0)
      ),
      new PIXI.Point(
        this._getOffsetX() + this._wallWidth + this._borderWidth,
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
    graphics.beginFill(0xff00ff);
    graphics.drawPolygon(hitArea);
    graphics.alpha = this._drawHitArea ? 1 : 0;
    graphics.endFill();

    const handleMoveEvent = (event: PIXI.InteractionEvent) => {
      if (event.target === graphics) {
        const position = event.data.getLocalPosition(graphics);
        this.props.onMouseMove({ offsetX: position.x, offsetY: position.y });
      }
    };

    graphics.addListener("mousemove", handleMoveEvent);
    graphics.addListener("mouseover", handleMoveEvent);
    graphics.addListener("mouseout", () => {
      this.props.onMouseOut();
    });

    graphics.interactive = true;

    this._hitAreaElement = graphics;
    this._hitAreaElement.x = this.x;
    this._hitAreaElement.y = this.y;
    this._hitAreaElement.scale = this.scale;
    this.props.hitAreaContainer.addChild(this._hitAreaElement);
  }

  private _getOffsetX() {
    return this.scale.x * this._offsets.x - this._borderWidth;
  }

  private _createPrimarySprite() {
    const sprite = new PIXI.TilingSprite(
      this._wallTexture ?? PIXI.Texture.WHITE,
      this._wallWidth,
      this.wallHeight
    );
    sprite.transform.setFromMatrix(new PIXI.Matrix(-1, 0.5, 0, 1));
    sprite.x = this._getOffsetX() + this._borderWidth + this._wallWidth;
    sprite.y = this.wallY;
    sprite.tint = this._wallLeftColor;

    return sprite;
  }

  private _createBorderSprite() {
    const border = new PIXI.TilingSprite(
      PIXI.Texture.WHITE,
      this._borderWidth,
      this._wallHeight + this._tileHeight
    );
    border.transform.setFromMatrix(new PIXI.Matrix(-1, -0.5, 0, 1));
    border.y = this.wallY + this._wallWidth / 2;
    border.x = this._getOffsetX() + this._borderWidth;

    border.tint = this._wallRightColor;

    return border;
  }

  private _createTopSprite() {
    const border = new PIXI.TilingSprite(
      PIXI.Texture.WHITE,
      this._borderWidth,
      this._wallWidth
    );
    border.transform.setFromMatrix(new PIXI.Matrix(1, 0.5, 1, -0.5));
    border.x = this._getOffsetX() + 0;
    border.y = this.wallY + this._wallWidth / 2 - this._borderWidth / 2;

    border.tint = this._wallTopColor;

    return border;
  }
}

export interface WallProps {
  hideBorder: boolean;
  hitAreaContainer: PIXI.Container;
  onMouseMove: (event: { offsetX: number; offsetY: number }) => void;
  onMouseOut: () => void;
  cutawayHeight?: number;
}
