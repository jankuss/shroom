import { Wall } from "../objects/room/Wall";
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
  maskOffsets: { x: number; y: number };
} {
  const wallInfo = new Walls(getWalls(tilemap));

  assertTileMapHasPadding(tilemap);

  const result: ParsedTileType[][] = tilemap.map((row) =>
    row.map(() => ({ type: "hidden" as const }))
  );

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

  for (let y = 0; y < tilemap.length; y++) {
    for (let x = 0; x < tilemap[y].length; x++) {
      const resultX = x;
      const resultY = y;

      const tileInfo = getTileInfo(tilemap, x, y);
      const tileInfoAbove = getTileInfo(tilemap, x, y + 1);

      const wall = wallInfo.getWall(x, y);

      if (wall != null) {
        switch (wall) {
          case "column":
            result[resultY][resultX] = {
              kind: "colWall",
              type: "wall",
              height: tileInfo.height ?? 0,
            };
            break;

          case "row":
            result[resultY][resultX] = {
              kind: "rowWall",
              type: "wall",
              height: tileInfo.height ?? 0,
              hideBorder: tileInfoAbove.rowDoor ? true : false,
            };
            break;

          case "innerCorner":
            result[resultY][resultX] = {
              kind: "innerCorner",
              type: "wall",
              height: tileInfo.height ?? 0,
            };
            break;

          case "outerCorner":
            result[resultY][resultX] = {
              kind: "outerCorner",
              type: "wall",
              height: tileInfo.height ?? 0,
            };
            break;
        }
      }

      if (!tileInfo.rowDoor || hasDoor) {
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

type WallBuilderInfo =
  | {
      type: "row";
      invalid: boolean;
      startY?: number;
      endY?: number;
      x?: number;
    }
  | {
      type: "column";
      invalid: boolean;
      startX?: number;
      endX?: number;
      y?: number;
    };

function getTile(tilemap: TileType[][], x: number, y: number) {
  const row = tilemap[y];

  if (row == null) return "x";

  return row[x] ?? "x";
}

class Walls {
  private _rowWalls = new Map<string, { type: "row" }>();
  private _colWalls = new Map<string, { type: "column" }>();

  constructor(infos: WallBuilderInfo[]) {
    infos.forEach((info) => {
      if (info.invalid) return;

      switch (info.type) {
        case "row":
          if (info.startY == null) throw new Error("Invalid start y");
          if (info.endY == null) throw new Error("Invalid end y");
          if (info.x == null) throw new Error("Invalid x");

          for (let y = info.endY; y <= info.startY; y++) {
            this._rowWalls.set(`${info.x}_${y}`, { type: "row" });
          }
          break;

        case "column":
          if (info.startX == null) throw new Error("Invalid start y");
          if (info.endX == null) throw new Error("Invalid end y");
          if (info.y == null) throw new Error("Invalid x");

          for (let x = info.startX; x <= info.endX; x++) {
            this._colWalls.set(`${x}_${info.y}`, { type: "column" });
          }
          break;
      }
    });
  }

  private _getRowWall(x: number, y: number) {
    return this._rowWalls.get(`${x}_${y}`);
  }

  private _getColWall(x: number, y: number) {
    return this._colWalls.get(`${x}_${y}`);
  }

  getWall(x: number, y: number) {
    const rightColWall = this._getColWall(x + 1, y);
    const bottomRowWall = this._getRowWall(x, y + 1);

    if (rightColWall != null && bottomRowWall != null) {
      // This is a outer corner
      return "outerCorner" as const;
    }

    const leftColWall = this._getColWall(x, y);
    const topRowWall = this._getRowWall(x, y);

    if (leftColWall != null && topRowWall != null) {
      return "innerCorner" as const;
    }

    const rowWall = this._getRowWall(x, y);
    if (rowWall != null) return rowWall.type;

    const colWall = this._getColWall(x, y);
    if (colWall != null) return colWall.type;
  }
}

function getWalls(tilemap: TileType[][]) {
  const start = findWallStartingTile(tilemap);

  if (start == null) return [];

  let currentWall: WallBuilderInfo = {
    type: "row",
    invalid: false,
    startY: start.y,
    x: start.x - 1,
  };
  let currentPosition = start;

  const walls: WallBuilderInfo[] = [];

  while (true) {
    if (tilemap[currentPosition.y][currentPosition.x] == null) break;

    const nextRowTilePosition = {
      ...currentPosition,
      y: currentPosition.y - 1,
    };
    const nextColTilePosition = {
      ...currentPosition,
      x: currentPosition.x + 1,
    };
    const aroundCornerTilePosition = {
      y: currentPosition.y - 1,
      x: currentPosition.x + 1,
    };

    const nextRowTile = getTile(
      tilemap,
      nextRowTilePosition.x,
      nextRowTilePosition.y
    );
    const nextColTile = getTile(
      tilemap,
      nextColTilePosition.x,
      nextColTilePosition.y
    );
    const aroundCornerTile = getTile(
      tilemap,
      aroundCornerTilePosition.x,
      aroundCornerTilePosition.y
    );

    const current = getTile(tilemap, currentPosition.x, currentPosition.y);

    if (currentWall.type === "row") {
      const adjacent = getTile(
        tilemap,
        currentPosition.x - 1,
        currentPosition.y
      );

      const adjacentInfo = getTileInfo(
        tilemap,
        currentPosition.x - 1,
        currentPosition.y
      );

      if (current !== "x" && (adjacent === "x" || adjacentInfo.rowDoor)) {
      } else {
        // Mark the wall as invalid. This means the wall won't be shown,
        // but we still continue following the edge tiles.

        currentWall.invalid = true;
      }

      if (nextRowTile !== "x") {
        currentPosition = nextRowTilePosition;
      } else {
        currentWall.endY = currentPosition.y;
        walls.push(currentWall);

        currentWall = {
          type: "column",
          invalid: false,
          startX: currentPosition.x,
          y: currentPosition.y - 1,
        };
      }
    } else if (currentWall.type === "column") {
      const adjacent = getTile(
        tilemap,
        currentPosition.x,
        currentPosition.y - 1
      );

      if (current !== "x" && adjacent === "x") {
      } else {
        // Mark the wall as invalid. This means the wall won't be shown,
        // but we still continue following the edge tiles.

        currentWall.invalid = true;
      }

      if (nextColTile !== "x" && aroundCornerTile === "x") {
        currentPosition = nextColTilePosition;
      } else {
        currentWall.endX = currentPosition.x;

        if (aroundCornerTile !== "x") {
          currentPosition = aroundCornerTilePosition;
          walls.push(currentWall);

          currentWall = {
            type: "row",
            invalid: false,
            startY: currentPosition.y,
            x: aroundCornerTilePosition.x - 1,
          };
        } else {
          walls.push(currentWall);
          break;
        }
      }
    }
  }

  return walls;
}

function findWallStartingTile(tilemap: TileType[][]) {
  let y = tilemap.length - 1;
  let x = 0;

  while (true) {
    const currentTile = tilemap[y][x];
    const info = getTileInfo(tilemap, x, y);

    if (currentTile !== "x" && !info.rowDoor) {
      return { x, y };
    }

    y--;

    if (y < 0) {
      y = tilemap.length - 1;
      x++;
    }
  }
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

function assertTileMapHasPadding(tilemap: TileType[][]) {
  if (tilemap.length < 1) throw new Error("Tilemap has no rows");

  let doorCount = 0;

  for (let y = 0; y < tilemap.length; y++) {
    const row = tilemap[y];

    if (row.length < 1) throw new Error("Tilemap row was empty.");

    if (row[0] !== "x") {
      if (doorCount > 0) throw new Error(paddingErrorMessage(`row ${y}`));
      doorCount++;
    }
  }

  for (let x = 0; x < tilemap[0].length; x++) {
    const cell = tilemap[0][x];

    if (cell !== "x") throw new Error(paddingErrorMessage(`column ${x}`));
  }
}

const paddingErrorMessage = (text: string) => `No padding for ${text}
- There should be one 'x' at the beginning of each row
- There should be a full row of 'x' as the first row

Please ensure that the tilemap is padded like the following example:
xxx
xoo
xoo
`;
