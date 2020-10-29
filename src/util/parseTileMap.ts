import { TileType, TileTypeNumber } from "../types/TileType";

export type ParsedTileType =
  | {
      type: "wall";
      kind: "colWall" | "rowWall" | "innerCorner" | "outerCorner";
      height: TileTypeNumber;
    }
  | { type: "tile"; z: number }
  | { type: "hidden" }
  | { type: "stairs"; kind: 0 | 2; z: number };

const isTile = (type: TileType): type is TileTypeNumber => !isNaN(Number(type));

export function parseTileMap(tilemap: TileType[][]): ParsedTileType[][] {
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

  const getTile = (x: number, y: number) => {
    if (cutoutTilemap[y] == null) return "x";
    if (cutoutTilemap[y][x] == null) return "x";

    return cutoutTilemap[y][x];
  };

  for (let y = 0; y < cutoutTilemap.length; y++) {
    let rowWallStartX = -1;

    for (let x = 0; x < cutoutTilemap[y].length; x++) {
      const resultX = x + 1;
      const resultY = y + 1;

      const type = getTile(x, y);

      const leftType = getTile(x - 1, y);
      const topType = getTile(x, y - 1);

      const topLeftDiagonalType = getTile(x - 1, y - 1);
      const bottomType = getTile(x, y + 1);
      const rightType = getTile(x + 1, y);

      const wallPositionX = resultX - 1;
      const wallPositionY = resultY - 1;

      const rowWallAllowed = rowWallMinimum.isWallAllowed(wallPositionX);

      if (leftType === "x" && isTile(type) && rowWallAllowed) {
        result[resultY][wallPositionX] = {
          type: "wall",
          kind: "rowWall",
          height: type,
        };
        rowWallMinimum.setValueIfLower(wallPositionX);
      }

      const columnWallAllowed =
        colWallMinimumY === -1 ||
        colWallMinimumY >= wallPositionY ||
        (globalWallStartX !== -1 && wallPositionX < globalWallStartX);

      if (topType === "x" && isTile(type) && columnWallAllowed) {
        result[wallPositionY][resultX] = {
          type: "wall",
          kind: "colWall",
          height: type,
        };
        colWallMinimumY = wallPositionY;

        if (rowWallStartX === -1) {
          rowWallStartX = wallPositionX;
        }
      }

      if (
        leftType === "x" &&
        topType === "x" &&
        isTile(type) &&
        rowWallAllowed &&
        columnWallAllowed
      ) {
        result[wallPositionY][wallPositionX] = {
          type: "wall",
          kind: "outerCorner",
          height: type,
        };
      }

      if (
        topLeftDiagonalType === "x" &&
        isTile(leftType) &&
        isTile(topType) &&
        isTile(type) &&
        columnWallAllowed
      ) {
        result[wallPositionY][wallPositionX] = {
          type: "wall",
          kind: "innerCorner",
          height: type,
        };
      }

      let isStair = false;
      if (isTile(topType) && isTile(type)) {
        const diff = Number(topType) - Number(type);
        if (diff === 1) {
          isStair = true;
          result[resultY][resultX] = { type: "stairs", kind: 0, z: type };
        }
      }

      if (isTile(type) && !isStair) {
        if (bottomType === "x" || rightType === "x") {
          result[resultY][resultX] = { type: "tile", z: type };
        } else {
          result[resultY][resultX] = { type: "tile", z: type };
        }
      }
    }

    if (
      globalWallStartX === -1 ||
      (rowWallStartX !== -1 && rowWallStartX < globalWallStartX)
    ) {
      globalWallStartX = rowWallStartX;
    }
  }

  return result;
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

  const result = initialize2DArray<TileType>(width, height, 0);

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
      hasTile = hasTile || isTile(tilemap[y][x]);
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
      hasTile = hasTile || isTile(tilemap[y][x]);
    }

    if (hasTile) {
      lastRow = y;
    }
  }

  return lastRow;
}
