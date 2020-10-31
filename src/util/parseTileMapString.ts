import { TileType } from "../types/TileType";

function toTileType(str: string) {
  return str as TileType;
}

export function parseTileMapString(str: string): TileType[][] {
  return str
    .split("\n")
    .map((row) => row.trimStart())
    .filter((row) => row.length > 0)
    .map((row) => row.split("").map(toTileType));
}
