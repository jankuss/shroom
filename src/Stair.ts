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
  direction: 0 | 2;
}

const positioning = 8;

export class Stair extends RoomObject {
  private sprites: PIXI.DisplayObject[] = [];
  private container: PIXI.Container | undefined;

  constructor(private props: Props) {
    super();
  }

  updateSprites() {
    this.container?.destroy();
    this.container = new PIXI.Container();

    const { geometry } = this.getRoomContext();
    const { roomX, roomY, roomZ, tileHeight, color, direction } = this.props;

    const { x, y } = geometry.getPosition(roomX, roomY, roomZ);

    const xEven = roomX % 2 === 0;
    const yEven = roomY % 2 === 0;

    for (let i = 0; i < 4; i++) {
      this.container.addChild(
        ...createStairBoxDirection0({
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

    this.getRoomContext().plane.addChild(this.container);
  }

  destroySprites() {
    this.container?.destroy();
  }

  destroy(): void {
    this.destroySprites();
  }

  registered(): void {
    this.updateSprites();
  }
}

const stairBase = 8;

interface StairBoxProps {
  x: number;
  y: number;
  index: number;
  tileHeight: number;
  xEven: boolean;
  yEven: boolean;
  color: string;
}

function createStairBoxDirection0({
  x,
  y,
  tileHeight,
  xEven,
  yEven,
  index,
  color,
}: StairBoxProps): PIXI.DisplayObject[] {
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

export function createStairBoxDirection2({
  x,
  y,
  tileHeight,
  xEven,
  yEven,
  index,
  color,
}: StairBoxProps) {
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

  return [tile];
}
