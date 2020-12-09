import { TileType, TileTypeNumber } from "../types/TileType";
import { getNumberOfTileType, getTileInfo } from "./getTileInfo";
import { isTile } from "./isTile";

export type ParsedTileType =
  | {
      type: "wall";
      kind: "colWall" | "rowWall" | "innerCorner" | "outerCorner";
      height: number;
      hideBorder?: boolean;
    }
  | { type: "tile"; z: number }
  | { type: "hidden" }
  | { type: "stairs"; kind: 0 | 2; z: number }
  | { type: "door"; z: number };

/**
 * Parses the standard tilemap format into a format with the following meta data:
 * - Walls
 * - Door
 * - Stairs
 * @param tilemap
 */
export function parseTileMap(
  tilemap: TileType[][]
): {
  tilemap: ParsedTileType[][];
  largestDiff: number;
  wallOffsets: { x: number; y: number };
  positionOffsets: { x: number; y: number };
} {
  const startIndexColumn = findFirstNonEmptyColumnIndex(tilemap);
  const startIndexRow = findFirstNonEmptyRowIndex(tilemap);

  if (startIndexColumn === -1) throw new Error("No column start found");
  if (startIndexRow === -1) throw new Error("No row start found");

  const endIndexColumn = findLastColumnIndex(tilemap);
  const endIndexRow = findLastRowIndex(tilemap);

  const cutoutTilemap = cutoutArray(
    tilemap,
    startIndexColumn,
    startIndexRow,
    endIndexColumn + 1,
    endIndexRow + 1
  );

  const result = initialize2DArray<ParsedTileType>(
    endIndexColumn - startIndexColumn + 1 + 1,
    endIndexRow - startIndexRow + 1 + 1,
    { type: "hidden" }
  );

  const rowWallMinimum = new RowWall();

  let colWallMinimumY = -1;
  let globalWallStartX = -1;

  let lowestTile: number | undefined;
  let highestTile: number | undefined;
  let hasDoor: boolean = false;

  function applyHighLowTile(current: number) {
    if (highestTile == null || current > highestTile) {
      highestTile = current;
    }

    if (lowestTile == null || current < lowestTile) {
      lowestTile = current;
    }
  }

  for (let y = 0; y < cutoutTilemap.length; y++) {
    let rowWallStartX = -1;

    for (let x = 0; x < cutoutTilemap[y].length; x++) {
      const resultX = x + 1;
      const resultY = y + 1;

      const wallPositionX = resultX - 1;
      const wallPositionY = resultY - 1;

      const tileInfo = getTileInfo(cutoutTilemap, x, y);

      if (!tileInfo.rowDoor || hasDoor) {
        const rowWallAllowed = rowWallMinimum.isWallAllowed(wallPositionX);
        if (tileInfo.rowEdge && tileInfo.height != null && rowWallAllowed) {
          const belowTileInfo = getTileInfo(cutoutTilemap, x - 1, y + 1);

          result[resultY][wallPositionX] = {
            type: "wall",
            kind: "rowWall",
            height: tileInfo.height,
            hideBorder: belowTileInfo.rowDoor,
          };

          rowWallMinimum.setValueIfLower(wallPositionX);
        }

        const columnWallAllowed =
          colWallMinimumY === -1 ||
          colWallMinimumY >= wallPositionY ||
          (globalWallStartX !== -1 && wallPositionX < globalWallStartX);

        if (tileInfo.colEdge && tileInfo.height != null && columnWallAllowed) {
          result[wallPositionY][resultX] = {
            type: "wall",
            kind: "colWall",
            height: tileInfo.height,
          };
          colWallMinimumY = wallPositionY;

          if (rowWallStartX === -1) {
            rowWallStartX = wallPositionX;
          }
        }

        if (
          tileInfo.rowEdge &&
          tileInfo.colEdge &&
          tileInfo.height != null &&
          rowWallAllowed &&
          columnWallAllowed
        ) {
          result[wallPositionY][wallPositionX] = {
            type: "wall",
            kind: "outerCorner",
            height: tileInfo.height,
          };
        }

        if (
          tileInfo.innerEdge &&
          tileInfo.height != null &&
          columnWallAllowed
        ) {
          result[wallPositionY][wallPositionX] = {
            type: "wall",
            kind: "innerCorner",
            height: tileInfo.height,
          };
        }

        if (tileInfo.stairs != null && tileInfo.height != null) {
          result[resultY][resultX] = {
            type: "stairs",
            kind: tileInfo.stairs.direction,
            z: tileInfo.height,
          };

          applyHighLowTile(tileInfo.height);
        } else if (tileInfo.height != null) {
          result[resultY][resultX] = { type: "tile", z: tileInfo.height };
          applyHighLowTile(tileInfo.height);
        }
      } else {
        hasDoor = true;
        result[resultY][resultX] = { type: "door", z: tileInfo.height ?? 0 };
      }

      if (
        globalWallStartX === -1 ||
        (rowWallStartX !== -1 && rowWallStartX < globalWallStartX)
      ) {
        globalWallStartX = rowWallStartX;
      }
    }
  }

  let largestDiff = 0;

  if (lowestTile != null && highestTile != null) {
    largestDiff = highestTile - lowestTile;
  }

  return {
    tilemap: result,
    largestDiff,
    wallOffsets: {
      x: 1,
      y: 1,
    },
    // When the tilemap has a door, we offset the objects in the room by one in the x direction.
    // This makes it so objects appear at the same position, for a room without a door
    // and for a room with a door.
    positionOffsets: {
      x: 1 + (hasDoor ? 1 : 0),
      y: 1,
    },
  };
}

class RowWall {
  private min: number = -1;

  setValueIfLower(value: number) {
    if (this.min === -1 || this.min > value) {
      this.min = value;
    }
  }

  isWallAllowed(value: number) {
    return this.min === -1 || this.min >= value;
  }
}

function cutoutArray(
  tilemap: TileType[][],
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  const width = endX - startX;
  const height = endY - startY;

  const result = initialize2DArray<TileType>(width, height, "0");

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      result[y][x] = tilemap[y + startY][x + startX];
    }
  }

  return result;
}

function initialize2DArray<T, TD = T>(
  maxX: number,
  maxY: number,
  defaultValue: TD | T
) {
  const res: (T | TD)[][] = [];

  for (let y = 0; y < maxY; y++) {
    const row: (T | TD)[] = [];
    for (let x = 0; x < maxX; x++) {
      row.push(defaultValue);
    }
    res.push(row);
  }

  return res;
}

function findFirstNonEmptyColumnIndex(tilemap: TileType[][]) {
  for (let x = 0; x < tilemap[0].length; x++) {
    for (let y = 0; y < tilemap.length; y++) {
      if (tilemap[y][x] !== "x") return x;
    }
  }

  return -1;
}

function findFirstNonEmptyRowIndex(tilemap: TileType[][]) {
  for (let y = 0; y < tilemap.length; y++) {
    for (let x = 0; x < tilemap[y].length; x++) {
      if (tilemap[y][x] !== "x") return y;
    }
  }

  return -1;
}

function findLastColumnIndex(tilemap: TileType[][]) {
  let lastColumn = 0;
  for (let x = 0; x < tilemap[0].length; x++) {
    let hasTile = false;
    for (let y = 0; y < tilemap.length; y++) {
      hasTile = hasTile || isTile(getNumberOfTileType(tilemap[y][x]));
    }

    if (hasTile) {
      lastColumn = x;
    }
  }

  return lastColumn;
}

function findLastRowIndex(tilemap: TileType[][]) {
  let lastRow = 0;
  for (let y = 0; y < tilemap.length; y++) {
    let hasTile = false;
    for (let x = 0; x < tilemap.length; x++) {
      hasTile = hasTile || isTile(getNumberOfTileType(tilemap[y][x]));
    }

    if (hasTile) {
      lastRow = y;
    }
  }

  return lastRow;
}
