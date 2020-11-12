import * as PIXI from "pixi.js";
import TileAsset from "../../assets/tile2.png";
import { createPlaneMatrix } from "./util/createPlaneMatrix";
import { getTileColors } from "./util/getTileColors";
import { IRoomContext } from "../../IRoomContext";
import { IRoomGeometry } from "../../IRoomGeometry";
import { IRoomObject } from "../../IRoomObject";
import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "./matrixes";
import { RoomObject } from "../../RoomObject";
import { ITexturable } from "../../ITextureable";
import { getZOrder } from "../../util/getZOrder";
import {
  getTilePositionForTile,
  TilePositionForTile,
} from "./util/getTilePositionForTile";

interface Props {
  geometry: IRoomGeometry;
  roomX: number;
  roomY: number;
  roomZ: number;
  tileHeight: number;
  color: string;
  direction: 0 | 2;
  texture?: PIXI.Texture;
}

export class Stair extends RoomObject implements ITexturable {
  private sprites: PIXI.DisplayObject[] = [];
  private container: PIXI.Container | undefined;

  private _texture: PIXI.Texture | undefined;
  private _color: string | undefined;

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

  updateSprites() {
    if (!this.mounted) return;

    this.container?.destroy();
    this.container = new PIXI.Container();

    const { roomX, roomY, roomZ, tileHeight, color, direction } = this.props;
    this.container.zIndex = getZOrder(roomX, roomY, roomZ);

    const { x, y } = this.geometry.getPosition(roomX, roomY, roomZ);

    for (let i = 0; i < 4; i++) {
      const props = {
        x,
        y,
        tileHeight,
        index: 3 - i,
        color: this.color ?? color,
        tilePositions: getTilePositionForTile(roomX, roomY),
        texture: this.texture ?? PIXI.Texture.WHITE,
      };

      if (direction === 0) {
        this.container.addChild(...createStairBoxDirection0(props));
      } else if (direction === 2) {
        this.container.addChild(...createStairBoxDirection2(props));
      }
    }

    this.visualization.addPlaneChild(this.container);
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
  color: string;
  tilePositions: TilePositionForTile;
  texture: PIXI.Texture;
}

function createStairBoxDirection0({
  x,
  y,
  tileHeight,
  index,
  color,
  tilePositions,
  texture,
}: StairBoxProps): PIXI.DisplayObject[] {
  const baseX = x + stairBase * index;
  const baseY = y - stairBase * index * 1.5;

  const { tileTint, borderRightTint, borderLeftTint } = getTileColors(color);

  function createSprite(
    matrix: PIXI.Matrix,
    tint: number,
    tilePosition: PIXI.Point
  ) {
    const tile = new PIXI.TilingSprite(texture);
    tile.tilePosition = tilePosition;
    tile.transform.setFromMatrix(matrix);

    tile.tint = tint;

    return tile;
  }

  const tile = createSprite(
    getFloorMatrix(baseX, baseY),
    tileTint,
    tilePositions.top
  );
  tile.width = 32;
  tile.height = tileHeight;

  const borderLeft = createSprite(
    getLeftMatrix(baseX, baseY, { width: 32, height: tileHeight }),
    borderLeftTint,
    tilePositions.left
  );
  borderLeft.width = 32;
  borderLeft.height = tileHeight;

  const borderRight = createSprite(
    getRightMatrix(baseX, baseY, { width: 8, height: tileHeight }),
    borderRightTint,
    tilePositions.right
  );

  borderRight.width = 8;
  borderRight.height = tileHeight;

  return [borderLeft, borderRight, tile];
}

export function createStairBoxDirection2({
  x,
  y,
  tileHeight,
  index,
  color,
  texture,
}: StairBoxProps) {
  const baseX = x - stairBase * index;
  const baseY = y - stairBase * index * 1.5;

  const { tileTint, borderRightTint, borderLeftTint } = getTileColors(color);

  function createSprite(matrix: PIXI.Matrix, tint: number) {
    const tile = new PIXI.TilingSprite(texture);
    tile.tilePosition = new PIXI.Point(0, 0);
    tile.transform.setFromMatrix(matrix);

    tile.tint = tint;

    return tile;
  }

  const tile = createSprite(
    getFloorMatrix(baseX + 32 - stairBase, baseY + stairBase * 1.5),
    tileTint
  );
  tile.width = stairBase;
  tile.height = 32;

  const borderLeft = createSprite(
    getLeftMatrix(baseX + 32 - stairBase, baseY + stairBase * 1.5, {
      width: stairBase,
      height: tileHeight,
    }),
    borderLeftTint
  );
  borderLeft.width = stairBase;
  borderLeft.height = tileHeight;

  const borderRight = createSprite(
    getRightMatrix(baseX, baseY, { width: 32, height: tileHeight }),
    borderRightTint
  );

  borderRight.width = 32;
  borderRight.height = tileHeight;

  return [borderLeft, borderRight, tile];
}
