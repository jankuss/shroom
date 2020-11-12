import * as PIXI from "pixi.js";
import { IRoomGeometry } from "../../IRoomGeometry";
import { RoomObject } from "../../RoomObject";
import TileAsset from "../../assets/tile2.png";
import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "./matrixes";
import { getTileColors } from "./util/getTileColors";
import { getZOrder } from "../../util/getZOrder";
import { ITexturable } from "../../ITextureable";
import { getTilePositionForTile } from "./util/getTilePositionForTile";

interface Props {
  geometry: IRoomGeometry;
  roomX: number;
  roomY: number;
  roomZ: number;
  edge?: boolean;
  tileHeight: number;
  color: string;
  texture?: PIXI.Texture;
}

export class Tile extends RoomObject implements ITexturable {
  private container: PIXI.Container | undefined;
  private sprites: PIXI.DisplayObject[] = [];

  private _texture: PIXI.Texture | undefined;
  private _color: string | undefined;

  constructor(private props: Props) {
    super();

    this._texture = props.texture;
    this._color = props.color;
  }

  get texture() {
    return this._texture;
  }

  set texture(value) {
    this._texture = value;
    this.updateSprites();
  }

  get color() {
    return this._color;
  }

  set color(value) {
    this._color = value;
    this.updateSprites();
  }

  private destroySprites() {
    this.sprites = [];
    this.sprites.forEach((sprite) => sprite.destroy());
  }

  private updateSprites() {
    if (!this.mounted) return;

    this.container?.destroy();
    this.container = new PIXI.Container();

    this.destroySprites();

    const {
      geometry,
      roomX,
      roomY,
      roomZ,
      edge = false,
      tileHeight,
    } = this.props;

    const { x, y } = geometry.getPosition(roomX, roomY, roomZ);
    this.container.zIndex = getZOrder(roomX, roomY, roomZ);

    const { borderLeftTint, borderRightTint, tileTint } = getTileColors(
      this._color ?? this.props.color
    );

    const tileMatrix = getFloorMatrix(x, y);

    const tilePositions = getTilePositionForTile(roomX, roomY);

    const tile = new PIXI.TilingSprite(this.texture ?? PIXI.Texture.WHITE);
    tile.tilePosition = tilePositions.top;

    tile.transform.setFromMatrix(tileMatrix);
    tile.width = 32;
    tile.height = 32;
    tile.tint = tileTint;

    const borderLeftMatrix = getLeftMatrix(x, y, {
      width: 32,
      height: tileHeight,
    });

    const borderRightMatrix = getRightMatrix(x, y, {
      width: 32,
      height: tileHeight,
    });

    const borderLeft = new PIXI.TilingSprite(
      this.texture ?? PIXI.Texture.WHITE
    );
    borderLeft.transform.setFromMatrix(borderLeftMatrix);
    borderLeft.width = 32;
    borderLeft.height = tileHeight;
    borderLeft.tilePosition = tilePositions.left;
    borderLeft.tint = borderLeftTint;

    const borderRight = new PIXI.TilingSprite(
      this.texture ?? PIXI.Texture.WHITE
    );
    borderRight.transform.setFromMatrix(borderRightMatrix);
    borderRight.width = 32;
    borderRight.height = tileHeight;
    borderRight.tilePosition = tilePositions.right;
    borderRight.tint = borderRightTint;

    this.sprites.push(this.container);

    this.container.addChild(borderLeft);
    this.container.addChild(borderRight);
    this.container.addChild(tile);

    this.visualization.addPlaneChild(this.container);
  }

  destroy(): void {
    this.destroySprites();
  }

  registered(): void {
    this.updateSprites();
  }
}
