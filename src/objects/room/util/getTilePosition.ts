import * as PIXI from "pixi.js";

export function getTilePosition(roomX: number, roomY: number) {
  const xEven = roomX % 2 === 0;
  const yEven = roomY % 2 === 0;

  return new PIXI.Point(xEven ? 0 : 32, yEven ? 32 : 0);
}
