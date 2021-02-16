import { IEventManager } from "../objects/events/interfaces/IEventManager";
import { ILandscapeContainer } from "../objects/room/ILandscapeContainer";
import { Room } from "../objects/room/Room";
import { IAnimationTicker } from "./IAnimationTicker";
import { IAvatarLoader } from "./IAvatarLoader";
import { IConfiguration } from "./IConfiguration";
import { IFurnitureLoader } from "./IFurnitureLoader";
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
  configuration: IConfiguration;
  tilemap: ITileMap;
  landscapeContainer: ILandscapeContainer;
  application: PIXI.Application;
  room: Room;
  eventManager: IEventManager;
}
