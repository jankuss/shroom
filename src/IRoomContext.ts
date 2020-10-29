import * as PIXI from "pixi.js";
import { IRoomGeometry } from "./IRoomGeometry";
import { IRoomObject } from "./IRoomObject";

export interface IRoomContext {
  container: PIXI.Container;
  plane: PIXI.Container;
  geometry: IRoomGeometry;
  addRoomObject: (object: IRoomObject) => void;
}
