import * as PIXI from "pixi.js";
import { IAnimationTicker } from "./IAnimationTicker";
import { IFurnitureLoader } from "./IFurnitureLoader";
import { IRoomGeometry } from "./IRoomGeometry";
import { IRoomObject } from "./IRoomObject";
import { IRoomVisualization } from "./IRoomVisualization";

export interface IRoomContext {
  geometry: IRoomGeometry;
  furnitureLoader: IFurnitureLoader;
  animationTicker: IAnimationTicker;
  visualization: IRoomVisualization;
}
