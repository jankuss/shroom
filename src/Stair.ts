import * as PIXI from "pixi.js";
import TileAsset from "./assets/tile.png";
import { IRoomGeometry } from "./IRoomGeometry";

interface Props {
  geometry: IRoomGeometry;
  roomX: number;
  roomY: number;
  roomZ: number;
  tileHeight: number;
}

const positioning = 8;

export class Stair extends PIXI.Container {
  constructor({ geometry, roomX, roomY, roomZ, tileHeight }: Props) {
    super();

    const { x, y } = geometry.getPosition(roomX, roomY, roomZ);
  }
}
