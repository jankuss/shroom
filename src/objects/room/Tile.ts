import * as PIXI from "pixi.js";
import { IRoomGeometry } from "../../IRoomGeometry";
import { RoomObject } from "../../RoomObject";
import TileAsset from "../../assets/tile2.png";
import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "./matrixes";
import { getTileColors } from "./util/getTileColors";
import { getZOrder } from "../../util/getZOrder";
import { ITexturable } from "../../ITextureable";

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

  constructor(private props: Props) {
    super();

    this._texture = props.texture;
  }

  get texture() {
    return this._texture;
  }

  set texture(value) {
    this._texture = value;
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
      color,
    } = this.props;

    const { x, y } = geometry.getPosition(roomX, roomY, roomZ);
    this.container.zIndex = getZOrder(roomX, roomY, roomZ);

    const xEven = roomX % 2 === 0;
    const yEven = roomY % 2 === 0;

    const { borderLeftTint, borderRightTint, tileTint } = getTileColors(color);

    const tilePosition = new PIXI.Point(xEven ? 32 : 0, yEven ? 32 : 0);

    const tileMatrix = getFloorMatrix(x, y);

    console.log("TXT", this.texture);
    const tile = new PIXI.TilingSprite(this.texture ?? PIXI.Texture.WHITE);
    tile.tilePosition = tilePosition;

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
    borderLeft.tilePosition = new PIXI.Point(0, 0);
    borderLeft.tint = borderLeftTint;

    const borderRight = new PIXI.TilingSprite(
      this.texture ?? PIXI.Texture.WHITE
    );
    borderRight.transform.setFromMatrix(borderRightMatrix);
    borderRight.width = 32;
    borderRight.height = tileHeight;
    borderRight.tilePosition = new PIXI.Point(0, 0);
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
