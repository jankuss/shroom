import { TileType } from "../../types/TileType";
import { getTileInfo } from "../getTileInfo";

export type RowWall = {
  startY: number;
  endY: number;
  x: number;
  height: number;
};

export function getRowWalls(tilemap: TileType[][]) {
  let lastY = tilemap.length - 1;

  let wallEndY: number | undefined;
  let wallStartY: number | undefined;
  let height: number | undefined;

  const walls: RowWall[] = [];

  for (let x = 0; x < tilemap[0].length; x++) {
    for (let y = lastY; y >= 0; y--) {
      const current = getTileInfo(tilemap, x, y);

      if (current.rowEdge && !current.rowDoor) {
        if (wallEndY == null) {
          wallEndY = y;
        }

        wallStartY = y;
        lastY = y - 1;

        if (height == null || (current.height ?? 0) < height) {
          height = current.height;
        }
      } else {
        if (wallEndY != null && wallStartY != null) {
          walls.push({
            startY: wallStartY,
            endY: wallEndY,
            x: x - 1,
            height: height ?? 0,
          });
          wallEndY = undefined;
          wallStartY = undefined;
          height = undefined;
        }
      }
    }
  }

  return walls;
}
