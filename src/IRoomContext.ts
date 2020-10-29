import * as PIXI from "pixi.js";
import { IAnimationTicker } from "./IAnimationTicker";
import { IFurnitureLoader } from "./IFurnitureLoader";
import { IRoomGeometry } from "./IRoomGeometry";
import { IRoomObject } from "./IRoomObject";

export interface IRoomContext {
  container: PIXI.Container;
  plane: PIXI.Container;
  geometry: IRoomGeometry;
  furnitureLoader: IFurnitureLoader;
  animationTicker: IAnimationTicker;

  addRoomObject: (object: IRoomObject) => void;
}
