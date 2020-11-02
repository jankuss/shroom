import * as PIXI from "pixi.js";
import { IAnimationTicker } from "./IAnimationTicker";
import { IFurnitureLoader } from "./IFurnitureLoader";
import { IRoomGeometry } from "./IRoomGeometry";
import { IRoomObject } from "./IRoomObject";
import { IRoomObjectContainer } from "./IRoomObjectContainer";
import { IRoomVisualization } from "./IRoomVisualization";

export interface IRoomContext {
  geometry: IRoomGeometry;
  furnitureLoader: IFurnitureLoader;
  animationTicker: IAnimationTicker;
  visualization: IRoomVisualization;
  roomObjectContainer: IRoomObjectContainer;
}
