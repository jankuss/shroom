import { getPosition } from "./getPosition";
import { ParsedTileType } from "../../../util/parseTileMap";

export function getTileMapBounds(
  tilemap: ParsedTileType[][],
  wallOffsets: { x: number; y: number }
) {
  let minX: number | undefined;
  let minY: number | undefined;

  let maxX: number | undefined;
  let maxY: number | undefined;

  tilemap.forEach((row, y) => {
    row.forEach((column, x) => {
      if (column.type !== "tile") return;
      const position = getPosition(x, y, column.z, wallOffsets);
      const localMaxX = position.x + 64;
      const localMaxY = position.y + 32;

      if (minX == null || position.x < minX) {
        minX = position.x;
      }

      if (minY == null || position.y < minY) {
        minY = position.y;
      }

      if (maxX == null || localMaxX > maxX) {
        maxX = localMaxX;
      }

      if (maxY == null || localMaxY > maxY) {
        maxY = localMaxY;
      }
    });
  });

  if (minX == null || minY == null || maxX == null || maxY == null) {
    throw new Error("Couldnt figure out dimensions");
  }

  return {
    minX,
    minY: minY - 32,
    maxX,
    maxY: maxY - 32,
  };
}
