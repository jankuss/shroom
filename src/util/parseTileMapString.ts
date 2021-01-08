import { TileType } from "../types/TileType";

function toTileType(str: string) {
  return str as TileType;
}

export function parseTileMapString(str: string): TileType[][] {
  // Thanks @Fusion for this code
  str = str.replace(/\r/g, "\n");
  str = str.replace(/ /g, "");

  return str
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.length > 0)
    .map((row) => row.split("").map(toTileType));
}
