import * as PIXI from "pixi.js";

import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "../matrixes";
import { IRoomPart } from "./IRoomPart";
import { RoomPartData } from "./RoomPartData";

interface Props {
  edge?: boolean;
  tileHeight: number;
  color: string;
  texture?: PIXI.Texture;
  door?: boolean;
}

export class Tile extends PIXI.Container implements IRoomPart {
  private _container: PIXI.Container | undefined;
  private _sprites: PIXI.DisplayObject[] = [];

  private _texture: PIXI.Texture | undefined;
  private _color: string | undefined;

  private _tileHeight: number;
  private _roomPartData: RoomPartData | undefined;
  private _tilePositions: PIXI.Point = new PIXI.Point(0, 0);

  get color() {
    return this._color;
  }

  set color(value) {
    this._color = value;
    this._updateSprites();
  }

  public get tilePositions() {
    return this._tilePositions;
  }

  public set tilePositions(value) {
    this._tilePositions = value;
    this._updateSprites();
  }

  public get tileHeight() {
    return this._tileHeight;
  }

  public set tileHeight(value) {
    this._tileHeight = value;
    this._updateSprites();
  }

  constructor(private props: Props) {
    super();

    this._texture = props.texture;
    this._color = props.color;
    this._tileHeight = props.tileHeight;

    this._updateSprites();
  }

  update(data: RoomPartData): void {
    this.tileHeight = data.tileHeight;
    this._roomPartData = data;
    this._texture = data.tileTexture;
    this._updateSprites();
  }

  private _destroySprites() {
    this._sprites.forEach((sprite) => sprite.destroy());
    this._sprites = [];
  }

  private _updateSprites() {
    this._container?.destroy();
    this._container = new PIXI.Container();

    this._destroySprites();

    const tileMatrix = getFloorMatrix(0, 0);

    const tile = new PIXI.TilingSprite(this._texture ?? PIXI.Texture.WHITE);

    tile.tilePosition = this.tilePositions;

    tile.transform.setFromMatrix(tileMatrix);
    tile.width = 32;
    tile.height = 32;
    tile.tint = this._roomPartData?.tileTopColor ?? 0;

    const borderLeftMatrix = getLeftMatrix(0, 0, {
      width: 32,
      height: this.tileHeight,
    });

    const borderRightMatrix = getRightMatrix(0, 0, {
      width: 32,
      height: this.tileHeight,
    });

    const borderLeft = new PIXI.TilingSprite(
      this._texture ?? PIXI.Texture.WHITE
    );

    borderLeft.tilePosition = this.tilePositions;

    borderLeft.transform.setFromMatrix(borderLeftMatrix);
    borderLeft.width = 32;
    borderLeft.height = this.tileHeight;
    borderLeft.tint = this._roomPartData?.tileLeftColor ?? 0;

    const borderRight = new PIXI.TilingSprite(
      this._texture ?? PIXI.Texture.WHITE
    );
    borderRight.tilePosition = this.tilePositions;

    borderRight.transform.setFromMatrix(borderRightMatrix);
    borderRight.width = 32;
    borderRight.height = this.tileHeight;
    borderRight.tint = this._roomPartData?.tileRightColor ?? 0;

    this._sprites.push(this._container);

    this._container.addChild(borderLeft);
    this._container.addChild(borderRight);
    this._container.addChild(tile);
    this.addChild(this._container);
  }
}
