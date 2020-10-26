import { TileType } from "../types/TileType";

function toTileType(str: string) {
  const number = Number(str);
  if (!isNaN(number)) return number as TileType;

  // TODO: Validate string
  return str as TileType;
}

export function parseTileMapString(str: string): TileType[][] {
  return str
    .split("\n")
    .map(row => row.trimStart())
    .filter(row => row.length > 0)
    .map(row => row.split("").map(toTileType));
}
