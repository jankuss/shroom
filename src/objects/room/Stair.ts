import * as PIXI from "pixi.js";
import TileAsset from "../../assets/tile2.png";
import { createPlaneMatrix } from "./util/createPlaneMatrix";
import { getTileColors } from "./util/getTileColors";
import { IRoomContext } from "../../IRoomContext";
import { IRoomGeometry } from "../../IRoomGeometry";
import { IRoomObject } from "../../IRoomObject";
import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "./matrixes";
import { RoomObject } from "../../RoomObject";

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

const texture = PIXI.Texture.from(TileAsset);

export class Stair extends RoomObject {
  private sprites: PIXI.DisplayObject[] = [];
  private container: PIXI.Container | undefined;

  constructor(private props: Props) {
    super();
  }

  updateSprites() {
    this.container?.destroy();
    this.container = new PIXI.Container();

    const { roomX, roomY, roomZ, tileHeight, color, direction } = this.props;

    const { x, y } = this.geometry.getPosition(roomX, roomY, roomZ);

    const xEven = roomX % 2 === 0;
    const yEven = roomY % 2 === 0;

    for (let i = 0; i < 4; i++) {
      const props = {
        x,
        y,
        xEven,
        yEven,
        tileHeight,
        index: 3 - i,
        color,
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

  function createSprite(matrix: PIXI.Matrix, tint: number) {
    const tile = new PIXI.TilingSprite(texture);
    tile.tilePosition = new PIXI.Point(0, 0);
    tile.transform.setFromMatrix(matrix);

    tile.tint = tint;

    return tile;
  }

  const tile = createSprite(getFloorMatrix(baseX, baseY), tileTint);
  tile.width = 32;
  tile.height = tileHeight;

  const borderLeft = createSprite(
    getLeftMatrix(baseX, baseY, { width: 32, height: tileHeight }),
    borderLeftTint
  );
  borderLeft.width = 32;
  borderLeft.height = tileHeight;

  const borderRight = createSprite(
    getRightMatrix(baseX, baseY, { width: 8, height: tileHeight }),
    borderRightTint
  );

  borderRight.width = 8;
  borderRight.height = tileHeight;

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
