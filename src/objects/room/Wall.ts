import * as PIXI from "pixi.js";
import { RoomObject } from "../RoomObject";
import { getWallColors } from "./util/getTileColors";
import { getZOrder } from "../../util/getZOrder";
import { IRoomGeometry } from "../../interfaces/IRoomGeometry";

interface Props {
  geometry: IRoomGeometry;
  roomX: number;
  roomY: number;
  roomZ: number;
  direction: "left" | "right" | "corner";
  tileHeight: number;
  wallHeight: number;
  wallDepth: number;
  side?: boolean;
  color: string;
  texture?: PIXI.Texture;
  hideBorder?: boolean;
  doorHeight?: number;
}

const wallWidth = 32;

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
  borderWidth,
}: {
  height: number;
  matrix: PIXI.Matrix;
  borderWidth: number;
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

export function createTopCorner(matrix: PIXI.Matrix, borderWidth: number) {
  const graphics = new PIXI.Graphics();
  graphics.beginFill(0xffffff);

  // draw a rectangle
  graphics.drawRect(0, 0, borderWidth, borderWidth);

  const transform = new PIXI.Transform();
  transform.setFromMatrix(matrix);

  graphics.transform = transform;

  return graphics;
}

export function createTopBorder(matrix: PIXI.Matrix, borderWidth: number) {
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
  borderWidth,
  doorHeight,
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
  borderWidth: number;
  doorHeight?: number;
}) {
  const top = createTopBorder(
    new PIXI.Matrix(
      1,
      0.5,
      1,
      -0.5,
      baseX + wallWidth - borderWidth,
      baseY - wallHeight + wallWidth / 2 - borderWidth / 2
    ),
    borderWidth
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
    borderWidth,
  });

  const actualWallHeight = doorHeight != null ? doorHeight : wallHeight;
  const actualOffset =
    doorHeight != null
      ? (offset ?? 0) + (wallHeight - doorHeight)
      : offset ?? 0;

  const primary = createWall({
    texture,
    height: actualWallHeight,
    matrix: new PIXI.Matrix(
      -1,
      0.5,
      0,
      1,
      baseX + 2 * wallWidth,
      baseY - wallHeight
    ),
    offset: actualOffset,
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
  borderWidth,
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
  borderWidth: number;
}) {
  const top = createTopBorder(
    new PIXI.Matrix(1, -0.5, 1, 0.5, baseX, baseY - wallHeight),
    borderWidth
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
    borderWidth,
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
  private _container: PIXI.Container | undefined;
  private _texture?: PIXI.Texture;
  private _color: string | undefined;

  private _border: PIXI.DisplayObject | undefined;
  private _top: PIXI.DisplayObject | undefined;
  private _primary: PIXI.DisplayObject | undefined;

  private _wallHeight: number;
  private _tileHeight: number;
  private _wallDepth: number;
  private _hideBorder: boolean;
  private _doorHeight: number | undefined;

  public get wallDepth() {
    return this._wallDepth;
  }

  public set wallDepth(value) {
    this._wallDepth = value;
    this.updateSprites();
  }

  public get wallHeight() {
    return this._wallHeight;
  }

  public set wallHeight(value) {
    this._wallHeight = value;
    this.updateSprites();
  }

  public get tileHeight() {
    return this._tileHeight;
  }

  public set tileHeight(value) {
    this._tileHeight = value;
    this.updateSprites();
  }

  constructor(private props: Props) {
    super();
    this._texture = props.texture;
    this._wallHeight = props.wallHeight;
    this._tileHeight = props.tileHeight;
    this._wallDepth = props.wallDepth;
    this._hideBorder = props.hideBorder ?? false;
    this._doorHeight = props.doorHeight;
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

  destroyed(): void {
    this._border?.destroy();
    this._top?.destroy();
    this._primary?.destroy();
  }

  registered(): void {
    this.updateSprites();
  }

  updateSprites() {
    if (!this.mounted) return;

    this._container?.destroy();
    this._container = new PIXI.Container();

    const {
      geometry,
      roomX,
      roomY,
      roomZ,
      direction,
      side = true,
      color,
    } = this.props;

    const { x, y } = geometry.getPosition(roomX, roomY, roomZ);
    const wallColor = this._color ?? color;

    const { leftTint, rightTint, topTint } = getWallColors(wallColor);
    this._container.zIndex = getZOrder(roomX, roomY, roomZ) - 1;

    const baseX = x;
    const baseY = y + 16;

    const offset = roomZ * 32;

    switch (direction) {
      case "left":
        const left = createWallLeft({
          baseX,
          baseY,
          wallHeight: this.wallHeight - offset,
          texture: this.texture ?? PIXI.Texture.WHITE,
          tileHeight: this.tileHeight,
          side,
          offset,
          borderTint: leftTint,
          wallTint: rightTint,
          topTint: topTint,
          borderWidth: this.wallDepth,
          doorHeight: this._doorHeight,
        });

        if (!this._hideBorder) {
          this._border = left.border;
        }
        this._primary = left.primary;
        this._top = left.top;
        break;

      case "right":
        const right = createWallRight({
          baseX,
          baseY,
          wallHeight: this.wallHeight - roomZ * 32,
          texture: this.texture ?? PIXI.Texture.WHITE,
          tileHeight: this.tileHeight,
          side,
          offset,
          borderTint: rightTint,
          wallTint: leftTint,
          topTint: topTint,
          borderWidth: this.wallDepth,
        });

        if (!this._hideBorder) {
          this._border = right.border;
        }

        this._primary = right.primary;
        this._top = right.top;
        break;

      case "corner":
        const corner = createTopCorner(
          new PIXI.Matrix(
            1,
            0.5,
            1,
            -0.5,
            baseX + wallWidth - this.wallDepth,
            baseY -
              this.wallHeight +
              wallWidth / 2 -
              this.wallDepth / 2 +
              roomZ * 32
          ),
          this.wallDepth
        );

        corner.tint = topTint;

        this._top = corner;
        break;
    }

    if (this._container != null) {
      if (this._top != null) {
        this._container.addChild(this._top);
      }

      if (this._border != null) {
        this._container.addChild(this._border);
      }

      if (this._primary != null) {
        this._container.addChild(this._primary);
      }
    }

    this.visualization.wallContainer.addChild(this._container);
  }
}
