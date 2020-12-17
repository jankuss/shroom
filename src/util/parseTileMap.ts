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
  assertTileMapHasPadding(tilemap);

  const result: ParsedTileType[][] = tilemap.map((row) =>
    row.map(() => ({ type: "hidden" as const }))
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

  for (let y = 0; y < tilemap.length; y++) {
    let rowWallStartX = -1;

    for (let x = 0; x < tilemap[y].length; x++) {
      const resultX = x;
      const resultY = y;

      const wallPositionX = resultX - 1;
      const wallPositionY = resultY - 1;

      const tileInfo = getTileInfo(tilemap, x, y);

      if (!tileInfo.rowDoor || hasDoor) {
        const rowWallAllowed = rowWallMinimum.isWallAllowed(wallPositionX);
        if (tileInfo.rowEdge && tileInfo.height != null && rowWallAllowed) {
          const belowTileInfo = getTileInfo(tilemap, x - 1, y + 1);

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

  for (let y = 0; y < tilemap.length; y++) {
    const row = tilemap[y];

    if (row.length < 1) throw new Error("Tilemap row was empty.");
  }

  for (let x = 0; x < tilemap[0].length; x++) {
    const cell = tilemap[0][x];

    if (cell !== "x") throw new Error(paddingErrorMessage(`column ${x}`));
  }
}

const paddingErrorMessage = (text: string) => `No padding for ${text}
- There should be one 'x' at the beginning of each row.
- There should be a full row of 'x' as the first row

Please ensure that the tilemap is padded like the following example:
xxx
xoo
xoo
`;
