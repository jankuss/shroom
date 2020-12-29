import { TileType } from "../../types/TileType";
import { getTileInfo } from "../getTileInfo";

export type ColumnWall = {
  startX: number;
  endX: number;
  y: number;
  height: number;
};

export function getColumnWalls(tilemap: TileType[][]) {
  let lastX = tilemap[0].length - 1;

  let wallEndX: number | undefined;
  let wallStartX: number | undefined;
  let height: number | undefined;

  const walls: ColumnWall[] = [];

  for (let y = 0; y < tilemap.length; y++) {
    for (let x = lastX; x >= 0; x--) {
      const current = getTileInfo(tilemap, x, y);

      if (current.colEdge && !current.rowDoor) {
        if (wallEndX == null) {
          wallEndX = x;
        }

        wallStartX = x;
        lastX = x - 1;
        if (height == null || (current.height ?? 0) < height) {
          height = current.height;
        }
      } else {
        if (wallEndX != null && wallStartX != null) {
          walls.push({
            startX: wallStartX,
            endX: wallEndX,
            y: y - 1,
            height: height ?? 0,
          });
          wallEndX = undefined;
          wallStartX = undefined;
          height = undefined;
        }
      }
    }
  }

  return walls;
}
