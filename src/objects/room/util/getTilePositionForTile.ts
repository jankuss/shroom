import { getTilePosition } from "./getTilePosition";

export function getTilePositionForTile(roomX: number, roomY: number) {
  return {
    top: getTilePosition(roomX, roomY),
    left: getTilePosition(roomX, roomY + 1),
    right: getTilePosition(roomX + 1, roomY),
  };
}

export interface TilePositionForTile {
  left: PIXI.Point;
  right: PIXI.Point;
  top: PIXI.Point;
}
