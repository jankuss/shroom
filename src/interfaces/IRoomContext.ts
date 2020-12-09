import { IAnimationTicker } from "./IAnimationTicker";
import { IAvatarLoader } from "./IAvatarLoader";
import { IConfiguration } from "./IConfiguration";
import { IFurnitureLoader } from "./IFurnitureLoader";
import { IHitDetection } from "./IHitDetection";
import { IRoomGeometry } from "./IRoomGeometry";
import { IRoomObjectContainer } from "./IRoomObjectContainer";
import { IRoomVisualization } from "./IRoomVisualization";
import { ITileMap } from "./ITileMap";

export interface IRoomContext {
  geometry: IRoomGeometry;
  furnitureLoader: IFurnitureLoader;
  avatarLoader: IAvatarLoader;
  animationTicker: IAnimationTicker;
  visualization: IRoomVisualization;
  roomObjectContainer: IRoomObjectContainer;
  hitDetection: IHitDetection;
  configuration: IConfiguration;
  tilemap: ITileMap;
}
