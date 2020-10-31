import * as PIXI from "pixi.js";
import TileAsset from "./assets/tile2.png";
import { createPlaneMatrix } from "./createPlaneMatrix";
import { getTileColors } from "./getTileColors";
import { IRoomContext } from "./IRoomContext";
import { IRoomGeometry } from "./IRoomGeometry";
import { IRoomObject } from "./IRoomObject";
import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "./matrixes";
import { createPlaneSprite } from "./Plane";
import { RoomObject } from "./RoomObject";

interface Props {
  geometry: IRoomGeometry;
  roomX: number;
  roomY: number;
  roomZ: number;
  edge?: boolean;
  tileHeight: number;
  color: string;
}

const texture = PIXI.Texture.from(TileAsset);
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

export class Tile extends RoomObject {
  private container: PIXI.Container | undefined;
  private sprites: PIXI.DisplayObject[] = [];

  constructor(private props: Props) {
    super();
  }

  private destroySprites() {
    this.sprites = [];
    this.sprites.forEach((sprite) => sprite.destroy());
  }

  private updateSprites() {
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

    const xEven = roomX % 2 === 0;
    const yEven = roomY % 2 === 0;

    const { borderLeftTint, borderRightTint, tileTint } = getTileColors(color);

    const tilePosition = new PIXI.Point(xEven ? 32 : 0, yEven ? 32 : 0);

    const tileMatrix = getFloorMatrix(x, y);

    const tile = new PIXI.TilingSprite(texture);
    tile.tilePosition = tilePosition;

    console.log(tileMatrix);

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

    const borderLeft = new PIXI.TilingSprite(texture);
    borderLeft.transform.setFromMatrix(borderLeftMatrix);
    borderLeft.width = 32;
    borderLeft.height = tileHeight;
    borderLeft.tilePosition = new PIXI.Point(0, 0);
    borderLeft.tint = borderLeftTint;

    const borderRight = new PIXI.TilingSprite(texture);
    borderRight.transform.setFromMatrix(borderRightMatrix);
    borderRight.width = 32;
    borderRight.height = tileHeight;
    borderRight.tilePosition = new PIXI.Point(0, 0);
    borderRight.tint = borderRightTint;

    this.sprites.push(this.container);

    this.container.addChild(borderLeft);
    this.container.addChild(borderRight);
    this.container.addChild(tile);

    this.getRoomContext().plane.addChild(this.container);
  }

  destroy(): void {
    this.destroySprites();
  }

  registered(): void {
    this.updateSprites();
  }
}
