import * as PIXI from "pixi.js";
import TileAsset from "./assets/tile.png";
import { getTileColors } from "./getTileColors";
import { IRoomContext } from "./IRoomContext";
import { IRoomGeometry } from "./IRoomGeometry";
import { IRoomObject } from "./IRoomObject";
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

    const tile = createPlaneSprite({
      x,
      y,
      xEven: xEven,
      yEven: yEven,
      width: 32,
      height: 32,
      points: {
        c: { x: 0, y: 16 },
        d: { x: 32, y: 0 },
        a: { x: 64, y: 16 },
        b: { x: 32, y: 32 },
      },
      floor: true,
      tint: tileTint,
    });

    const borderLeft = createPlaneSprite({
      x: x,
      y: y - 16 + tileHeight,
      width: 32,
      height: tileHeight,
      points: {
        d: { x: 0, y: 0 },
        a: { x: 32, y: 16 },
        b: { x: 32, y: 16 + 32 },
        c: { x: 0, y: 32 },
      },
      xEven: xEven,
      yEven: yEven,
      floor: true,
      tint: borderLeftTint,
    });

    const borderRight = createPlaneSprite({
      x: x + 32,
      y: y + tileHeight,
      width: 32,
      height: tileHeight,
      points: {
        d: { x: 0, y: 0 },
        a: { x: 32, y: -16 },
        b: { x: 32, y: -16 + 32 },
        c: { x: 0, y: 32 },
      },
      xEven: xEven,
      yEven: yEven,
      floor: true,
      tint: borderRightTint,
    });

    this.sprites.push(this.container);

    this.container.addChild(tile);
    this.container.addChild(borderRight);
    this.container.addChild(borderLeft);

    this.getRoomContext().plane.addChild(this.container);
  }

  destroy(): void {
    this.destroySprites();
  }

  registered(): void {
    this.updateSprites();
  }
}
