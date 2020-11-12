import * as PIXI from "pixi.js";
import { IRoomGeometry } from "../../IRoomGeometry";
import { RoomObject } from "../../RoomObject";

import WallAsset from "../../assets/wall2.png";
import { getWallColors } from "./util/getTileColors";
import { getZOrder } from "../../util/getZOrder";

interface Props {
  geometry: IRoomGeometry;
  roomX: number;
  roomY: number;
  roomZ: number;
  direction: "left" | "right" | "corner";
  tileHeight: number;
  wallHeight: number;
  side?: boolean;
  color: string;
  texture?: PIXI.Texture;
}

const wallWidth = 32;
const borderWidth = 10;

export function createWall({
  texture,
  height,
  matrix,
  width = wallWidth,
  offset = 0,
}: {
  height: number;
  texture: PIXI.Texture;
  matrix: PIXI.Matrix;
  width?: number;
  offset?: number;
}) {
  const sprite = new PIXI.TilingSprite(texture);

  const transform = new PIXI.Transform();
  transform.setFromMatrix(matrix);

  sprite.height = height;
  sprite.width = width;
  sprite.transform = transform;

  sprite.tilePosition = new PIXI.Point(0, height + offset);

  return sprite;
}

export function createBorder({
  height,
  matrix,
}: {
  height: number;
  matrix: PIXI.Matrix;
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

export function createTopCorner(matrix: PIXI.Matrix) {
  const graphics = new PIXI.Graphics();
  graphics.beginFill(0xffffff);

  // draw a rectangle
  graphics.drawRect(0, 0, borderWidth, borderWidth);

  const transform = new PIXI.Transform();
  transform.setFromMatrix(matrix);

  graphics.transform = transform;

  return graphics;
}

export function createTopBorder(matrix: PIXI.Matrix) {
  const graphics = new PIXI.Graphics();
  graphics.beginFill(0xffffff);

  // draw a rectangle
  graphics.drawRect(0, 0, borderWidth, wallWidth);

  const transform = new PIXI.Transform();
  transform.setFromMatrix(matrix);

  graphics.transform = transform;

  return graphics;
}

export function createWallLeft({
  baseX,
  baseY,
  wallHeight,
  tileHeight,
  texture,
  side,
  offset,
  borderTint,
  topTint,
  wallTint,
}: {
  baseX: number;
  baseY: number;
  wallHeight: number;
  tileHeight: number;
  texture: PIXI.Texture;
  side: boolean;
  offset: number;
  borderTint: number;
  wallTint: number;
  topTint: number;
}) {
  const top = createTopBorder(
    new PIXI.Matrix(
      1,
      0.5,
      1,
      -0.5,
      baseX + wallWidth - borderWidth,
      baseY - wallHeight + borderWidth + 1
    )
  );

  const border = createBorder({
    height: wallHeight + tileHeight,
    matrix: new PIXI.Matrix(
      1,
      0.5,
      0,
      1,
      baseX + wallWidth - borderWidth,
      baseY - wallHeight + wallWidth / 2 - borderWidth / 2
    ),
  });

  const primary = createWall({
    texture,
    height: wallHeight,
    matrix: new PIXI.Matrix(
      -1,
      0.5,
      0,
      1,
      baseX + 2 * wallWidth,
      baseY - wallHeight
    ),
    offset,
  });

  border.tint = borderTint;
  primary.tint = wallTint;
  top.tint = topTint;

  return {
    border: side ? border : undefined,
    primary,
    top,
  };
}

export function createWallRight({
  baseX,
  baseY,
  wallHeight,
  texture,
  tileHeight,
  side,
  offset,
  borderTint,
  topTint,
  wallTint,
}: {
  baseX: number;
  baseY: number;
  wallHeight: number;
  tileHeight: number;
  texture: PIXI.Texture;
  side: boolean;
  offset: number;
  borderTint: number;
  wallTint: number;
  topTint: number;
}) {
  const top = createTopBorder(
    new PIXI.Matrix(1, -0.5, 1, 0.5, baseX, baseY - wallHeight)
  );

  const border = createBorder({
    height: wallHeight + tileHeight,
    matrix: new PIXI.Matrix(
      -1,
      0.5,
      0,
      1,
      baseX + wallWidth + borderWidth,
      baseY - wallHeight + wallWidth / 2 - borderWidth / 2
    ),
  });

  const primary = createWall({
    texture,
    height: wallHeight,
    matrix: new PIXI.Matrix(1, 0.5, 0, 1, baseX, baseY - wallHeight),
    offset,
  });

  border.tint = borderTint;
  primary.tint = wallTint;
  top.tint = topTint;

  return {
    border: side ? border : undefined,
    primary,
    top,
  };
}

export class Wall extends RoomObject {
  private container: PIXI.Container | undefined;
  private _texture?: PIXI.Texture;
  private _color: string | undefined;

  private border: PIXI.DisplayObject | undefined;
  private top: PIXI.DisplayObject | undefined;
  private primary: PIXI.DisplayObject | undefined;

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

  get color() {
    return this._color;
  }

  set color(value) {
    this._color = value;
    this.updateSprites();
  }

  destroy(): void {
    this.border?.destroy();
    this.top?.destroy();
    this.primary?.destroy();
  }

  registered(): void {
    this.updateSprites();
  }

  updateSprites() {
    if (!this.mounted) return;

    this.container?.destroy();
    this.container = new PIXI.Container();

    const {
      geometry,
      roomX,
      roomY,
      roomZ,
      direction,
      tileHeight,
      wallHeight,
      side = true,
      color,
    } = this.props;

    const { x, y } = geometry.getPosition(roomX, roomY, roomZ);
    const wallColor = this.texture != null ? "#ffffff" : this._color ?? color;

    const { leftTint, rightTint, topTint } = getWallColors(wallColor);
    this.container.zIndex = getZOrder(roomX, roomY, roomZ) - 1;

    const baseX = x;
    const baseY = y + 16;

    const offset = roomZ * 32;

    switch (direction) {
      case "left":
        const left = createWallLeft({
          baseX,
          baseY,
          wallHeight: wallHeight - offset,
          texture: this.texture ?? PIXI.Texture.WHITE,
          tileHeight: tileHeight,
          side,
          offset,
          borderTint: leftTint,
          wallTint: rightTint,
          topTint: topTint,
        });

        this.border = left.border;
        this.primary = left.primary;
        this.top = left.top;
        break;

      case "right":
        const right = createWallRight({
          baseX,
          baseY,
          wallHeight: wallHeight - roomZ * 32,
          texture: this.texture ?? PIXI.Texture.WHITE,
          tileHeight: tileHeight,
          side,
          offset,
          borderTint: rightTint,
          wallTint: leftTint,
          topTint: topTint,
        });

        this.border = right.border;
        this.primary = right.primary;
        this.top = right.top;
        break;

      case "corner":
        const corner = createTopCorner(
          new PIXI.Matrix(
            1,
            0.5,
            1,
            -0.5,
            baseX + wallWidth - borderWidth,
            baseY - wallHeight + offset + borderWidth + 1
          )
        );

        corner.tint = topTint;

        this.top = corner;
        break;
    }

    if (this.container != null) {
      if (this.top != null) {
        this.container.addChild(this.top);
      }

      if (this.border != null) {
        this.container.addChild(this.border);
      }

      if (this.primary != null) {
        this.container.addChild(this.primary);
      }
    }

    this.visualization.addPlaneChild(this.container);
  }
}
