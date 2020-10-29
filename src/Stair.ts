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
  tileHeight: number;
  color: string;
}

const positioning = 8;

export class Stair extends RoomObject {
  private sprites: PIXI.DisplayObject[] = [];

  constructor(private props: Props) {
    super();
  }

  updateSprites() {
    const { geometry } = this.getRoomContext();
    const { roomX, roomY, roomZ, tileHeight, color } = this.props;

    const { x, y } = geometry.getPosition(roomX, roomY, roomZ);

    const xEven = roomX % 2 === 0;
    const yEven = roomY % 2 === 0;

    for (let i = 0; i < 4; i++) {
      this.sprites.push(
        ...createStairBox({
          x,
          y,
          xEven,
          yEven,
          tileHeight,
          index: 3 - i,
          color,
        })
      );
    }

    this.sprites.forEach((sprite) =>
      this.getRoomContext().plane.addChild(sprite)
    );
  }

  destroySprites() {
    this.sprites.forEach((sprite) => sprite.destroy());
    this.sprites = [];
  }

  destroy(): void {
    this.destroySprites();
  }

  registered(): void {
    this.updateSprites();
  }
}

function createStairBox({
  x,
  y,
  tileHeight,
  xEven,
  yEven,
  index,
  color,
}: {
  x: number;
  y: number;
  index: number;
  tileHeight: number;
  xEven: boolean;
  yEven: boolean;
  color: string;
}): PIXI.DisplayObject[] {
  const stairBase = 8;

  const baseX = x + stairBase * index;
  const baseY = y - stairBase * index * 1.5;

  const { tileTint, borderRightTint, borderLeftTint } = getTileColors(color);

  const tile = createPlaneSprite({
    x: baseX,
    y: baseY,
    xEven: xEven,
    yEven: yEven,
    width: 32,
    height: stairBase,
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
    x: baseX,
    y: baseY - 16 + tileHeight,
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
    x: baseX + 32,
    y: baseY + tileHeight,
    width: stairBase,
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

  return [borderLeft, borderRight, tile];
}
