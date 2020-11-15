import * as PIXI from "pixi.js";
import { IAnimationTicker } from "./IAnimationTicker";
import { IAvatarLoader } from "./IAvatarLoader";
import { IFurnitureLoader } from "./IFurnitureLoader";
import { IHitDetection } from "./IHitDetection";
import { IRoomGeometry } from "./IRoomGeometry";
import { IRoomObject } from "./IRoomObject";
import { IRoomObjectContainer } from "./IRoomObjectContainer";
import { IRoomVisualization } from "./IRoomVisualization";

export interface IRoomContext {
  geometry: IRoomGeometry;
  furnitureLoader: IFurnitureLoader;
  avatarLoader: IAvatarLoader;
  animationTicker: IAnimationTicker;
  visualization: IRoomVisualization;
  roomObjectContainer: IRoomObjectContainer;
  hitDetection: IHitDetection;
}
