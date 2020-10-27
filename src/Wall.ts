import * as PIXI from "pixi.js";
import { IRoomGeometry } from "./IRoomGeometry";
import WallAsset from "./assets/wall2.png";

interface Props {
  geometry: IRoomGeometry;
  roomX: number;
  roomY: number;
  direction: "left" | "right";
  tileHeight: number;
  wallHeight: number;
}

const wallWidth = 32;
const borderWidth = 10;

export function createWall({
  texture,
  height,
  matrix,
  width = wallWidth,
}: {
  height: number;
  texture: PIXI.Texture;
  matrix: PIXI.Matrix;
  width?: number;
}) {
  const sprite = new PIXI.TilingSprite(texture);

  const transform = new PIXI.Transform();
  transform.setFromMatrix(matrix);

  sprite.height = height;
  sprite.width = width;
  sprite.transform = transform;

  sprite.tilePosition = new PIXI.Point(0, height);

  return sprite;
}

export function createBorder({
  height,
  matrix,
  texture,
}: {
  height: number;
  matrix: PIXI.Matrix;
  texture: PIXI.Texture;
}) {
  const graphics = new PIXI.Graphics();
  graphics.beginFill(0xffffff);

  // draw a rectangle
  graphics.drawRect(0, 0, borderWidth, height);

  const transform = new PIXI.Transform();
  transform.setFromMatrix(matrix);

  graphics.transform = transform;

  return graphics;
}

export function createWallLeft({
  baseX,
  baseY,
  height,
  texture,
}: {
  baseX: number;
  baseY: number;
  height: number;
  texture: PIXI.Texture;
}) {
  const border = createBorder({
    texture,
    height,
    matrix: new PIXI.Matrix(
      1,
      0.5,
      0,
      1,
      baseX + wallWidth - borderWidth,
      baseY - height + wallWidth / 2 - borderWidth / 2
    ),
  });

  const primary = createWall({
    texture,
    height,
    matrix: new PIXI.Matrix(-1, 0.5, 0, 1, baseX + 64, baseY - height),
  });

  return [border, primary];
}

export function createWallRight({
  baseX,
  baseY,
  height,
  texture,
}: {
  baseX: number;
  baseY: number;
  height: number;
  texture: PIXI.Texture;
}) {
  const border = createBorder({
    texture,
    height,
    matrix: new PIXI.Matrix(
      -1,
      0.5,
      0,
      1,
      baseX + wallWidth + borderWidth,
      baseY - height + wallWidth / 2 - borderWidth / 2
    ),
  });

  const primary = createWall({
    texture,
    height,
    matrix: new PIXI.Matrix(1, 0.5, 0, 1, baseX, baseY - height),
  });

  return [border, primary];
}

export class Wall extends PIXI.Container {
  constructor({
    geometry,
    roomX,
    roomY,
    direction,
    tileHeight,
    wallHeight,
  }: Props) {
    super();

    const displayHeight = wallHeight;

    const { x, y } = geometry.getPosition(roomX, roomY, 0);

    const baseX = x;
    const baseY = y + 16;

    const wallTexture = PIXI.Texture.from(WallAsset);

    switch (direction) {
      case "left":
        const left = createWallLeft({
          baseX,
          baseY,
          height: wallHeight,
          texture: wallTexture,
        });
        this.addChild(...left);
        break;

      case "right":
        const right = createWallRight({
          baseX,
          baseY,
          height: wallHeight,
          texture: wallTexture,
        });
        this.addChild(...right);
        break;
    }
  }
}
