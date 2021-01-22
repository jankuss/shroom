import { TileType } from "../types/TileType";
import { getTileInfo } from "./getTileInfo";
import { ColumnWall, getColumnWalls } from "./tilemap/getColumnWalls";
import { getRowWalls, RowWall } from "./tilemap/getRowWalls";
import { padTileMap } from "./tilemap/padTileMap";

export type ParsedTileWall = {
  type: "wall";
  kind: "colWall" | "rowWall" | "innerCorner" | "outerCorner";
  height: number;
  hideBorder?: boolean;
};

export type ParsedTileType =
  | ParsedTileWall
  | { type: "tile"; z: number }
  | { type: "hidden" }
  | { type: "stairs"; kind: 0 | 2; z: number }
  | { type: "stairCorner"; kind: "left" | "right" | "front"; z: number }
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
  maskOffsets: { x: number; y: number };
} {
  const wallInfo = new Walls(getRowWalls(tilemap), getColumnWalls(tilemap));

  padTileMap(tilemap);

  const result: ParsedTileType[][] = tilemap.map((row) =>
    row.map(() => ({ type: "hidden" as const }))
  );

  let lowestTile: number | undefined;
  let highestTile: number | undefined;
  let hasDoor = false;

  function applyHighLowTile(current: number) {
    if (highestTile == null || current > highestTile) {
      highestTile = current;
    }

    if (lowestTile == null || current < lowestTile) {
      lowestTile = current;
    }
  }

  for (let y = 0; y < tilemap.length; y++) {
    for (let x = 0; x < tilemap[y].length; x++) {
      const resultX = x;
      const resultY = y;

      const tileInfo = getTileInfo(tilemap, x, y);
      const tileInfoBelow = getTileInfo(tilemap, x, y + 1);
      const tileInfoRight = getTileInfo(tilemap, x + 1, y);

      const wall = wallInfo.getWall(x, y);

      if (wall != null) {
        switch (wall.kind) {
          case "column": {
            const colWallHeightDiff =
              tileInfoBelow.height != null
                ? Math.abs(tileInfoBelow.height - wall.height)
                : 0;

            result[resultY][resultX] = {
              kind: "colWall",
              type: "wall",
              height: wall.height,
              hideBorder: colWallHeightDiff > 0,
            };
            break;
          }

          case "row": {
            const rowWallHeightDiff =
              tileInfoRight.height != null
                ? Math.abs(tileInfoRight.height - wall.height)
                : 0;

            result[resultY][resultX] = {
              kind: "rowWall",
              type: "wall",
              height: wall.height,
              hideBorder: tileInfoBelow.rowDoor || rowWallHeightDiff > 0,
            };
            break;
          }

          case "innerCorner": {
            result[resultY][resultX] = {
              kind: "innerCorner",
              type: "wall",
              height: wall.height,
            };
            break;
          }

          case "outerCorner": {
            result[resultY][resultX] = {
              kind: "outerCorner",
              type: "wall",
              height: wall.height,
            };
            break;
          }
        }
      }

      if (!tileInfo.rowDoor || hasDoor) {
        if (tileInfo.stairs != null && tileInfo.height != null) {
          if (tileInfo.stairs.isCorner) {
            result[resultY][resultX] = {
              type: "stairCorner",
              kind: tileInfo.stairs.cornerType,
              z: tileInfo.height,
            };
          } else if (tileInfo.stairs.direction != null) {
            result[resultY][resultX] = {
              type: "stairs",
              kind: tileInfo.stairs.direction,
              z: tileInfo.height,
            };
          }

          applyHighLowTile(tileInfo.height);
        } else if (tileInfo.height != null) {
          result[resultY][resultX] = { type: "tile", z: tileInfo.height };
          applyHighLowTile(tileInfo.height);
        }
      } else {
        hasDoor = true;
        result[resultY][resultX] = { type: "door", z: tileInfo.height ?? 0 };
      }
    }
  }

  let largestDiff = 0;

  if (lowestTile != null && highestTile != null) {
    largestDiff = highestTile - lowestTile;
  }

  const wallOffsets = {
    x: 1,
    y: 1,
  };

  return {
    tilemap: result,
    largestDiff,
    wallOffsets,
    // When the tilemap has a door, we offset the objects in the room by one in the x direction.
    // This makes it so objects appear at the same position, for a room without a door
    // and for a room with a door.
    positionOffsets: { x: 0, y: 0 },
    maskOffsets: { x: -wallOffsets.x, y: -wallOffsets.y },
  };
}

class Walls {
  private _rowWalls = new Map<string, RowWall>();
  private _colWalls = new Map<string, ColumnWall>();

  constructor(rowWalls: RowWall[], colWalls: ColumnWall[]) {
    rowWalls.forEach((info) => {
      for (let y = info.startY; y <= info.endY; y++) {
        this._rowWalls.set(`${info.x}_${y}`, info);
      }
    });

    colWalls.forEach((info) => {
      for (let x = info.startX; x <= info.endX; x++) {
        this._colWalls.set(`${x}_${info.y}`, info);
      }
    });
  }

  getWall(x: number, y: number) {
    const rightColWall = this._getColWall(x + 1, y);
    const bottomRowWall = this._getRowWall(x, y + 1);

    if (rightColWall != null && bottomRowWall != null) {
      // This is a outer corner
      return {
        kind: "outerCorner" as const,
        height: Math.min(rightColWall.height, bottomRowWall.height),
      };
    }

    const leftColWall = this._getColWall(x, y);
    const topRowWall = this._getRowWall(x, y);

    if (leftColWall != null && topRowWall != null) {
      return {
        kind: "innerCorner" as const,
        height: Math.min(leftColWall.height, topRowWall.height),
      };
    }

    const rowWall = this._getRowWall(x, y);
    if (rowWall != null)
      return {
        kind: "row" as const,
        height: rowWall.height,
      };

    const colWall = this._getColWall(x, y);
    if (colWall != null) return { kind: "column", height: colWall.height };
  }

  private _getRowWall(x: number, y: number) {
    return this._rowWalls.get(`${x}_${y}`);
  }

  private _getColWall(x: number, y: number) {
    return this._colWalls.get(`${x}_${y}`);
  }
}
