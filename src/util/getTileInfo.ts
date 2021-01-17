import { TileType } from "../types/TileType";
import { isTile } from "./isTile";

const offsets = {
  none: { x: 0, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  topLeft: { x: -1, y: -1 },
  bottomLeft: { x: -1, y: 1 },
  right: { x: 1, y: 0 },
  topRight: { x: 1, y: -1 },
  bottomRight: { x: 1, y: 1 },
};

export type NumberOfTile = number | "x";

export function getNumberOfTileType(tileType: TileType): number | "x" {
  if (tileType === "x" || tileType == null) return "x";

  const parsedNumber = Number(tileType);

  if (isNaN(parsedNumber)) {
    const offset = 9;

    return tileType.charCodeAt(0) - 96 + offset;
  }

  return parsedNumber;
}

const getTile = (
  tiles: TileType[][],
  x: number,
  y: number,
  offset: keyof typeof offsets = "none"
) => {
  x = x + offsets[offset].x;
  y = y + offsets[offset].y;

  if (tiles[y] == null) return "x";
  if (tiles[y][x] == null) return "x";

  return getNumberOfTileType(tiles[y][x]);
};

export function getTileInfo(tiles: TileType[][], x: number, y: number) {
  const type = getTile(tiles, x, y);

  const leftType = getTile(tiles, x - 1, y);
  const topType = getTile(tiles, x, y - 1);

  const topLeftDiagonalType = getTile(tiles, x - 1, y - 1);
  const bottomLeftDiagonalType = getTile(tiles, x - 1, y + 1);
  const bottomType = getTile(tiles, x, y + 1);
  const rightType = getTile(tiles, x + 1, y);

  // A row door can be identified if its surrounded by nothing to the left, top and bottom.
  const rowDoor =
    topType === "x" &&
    leftType === "x" &&
    topLeftDiagonalType === "x" &&
    bottomType === "x" &&
    bottomLeftDiagonalType === "x" &&
    isTile(rightType) &&
    isTile(type);

  const stairs = getStairs(tiles, x, y);
  const baseHeight = isTile(type) ? type : undefined;

  return {
    rowEdge: leftType === "x" && isTile(type),
    colEdge: topType === "x" && isTile(type),
    innerEdge:
      topLeftDiagonalType === "x" &&
      isTile(type) &&
      isTile(topType) &&
      isTile(leftType),
    stairs: stairs,
    height: baseHeight,
    rowDoor: rowDoor,
  };
}

/**
 * Get stair information for the tile at the given x/y position.
 */
function getStairs(tiles: TileType[][], x: number, y: number) {
  const type = getTile(tiles, x, y);
  const topType = getTile(tiles, x, y, "top");
  const leftType = getTile(tiles, x, y, "left");
  const rightType = getTile(tiles, x, y, "right");
  const topLeftType = getTile(tiles, x, y, "topLeft");
  const bottomLeftType = getTile(tiles, x, y, "bottomLeft");
  const topRightType = getTile(tiles, x, y, "topRight");
  


  if (isTile(topType) && isTile(type)) {
    const diff = Number(topType) - Number(type);

    if (diff === 1) {
      return { direction: 0 as const };
    }
  }

  if (isTile(leftType) && isTile(type)) {
    const diff = Number(leftType) - Number(type);

    if (diff === 1) {
      return { direction: 2 as const };
    }
  }

  if (isTile(bottomLeftType) && isTile(type) && (leftType === 'x' || Number(leftType) <= Number(type))) 
  {
    const diff = Number(bottomLeftType) - Number(type);
    if (diff === 1) {
      return { cornerType: 'left' as const, isCorner: true};
    }
  }

  if (isTile(topRightType) && isTile(type) && (rightType === 'x' || Number(rightType) <= Number(type))) 
  {
    const diff = Number(topRightType) - Number(type);
    if (diff === 1) {
      return { cornerType: 'right' as const, isCorner: true};
    }
  }

  if (isTile(topLeftType) && isTile(type) && (leftType === 'x' || Number(leftType) <= Number(type))) 
  {
    const diff = Number(topLeftType) - Number(type);
    if (diff === 1) {
      return { cornerType: 'front' as const, isCorner: true};
    }
  }
}
