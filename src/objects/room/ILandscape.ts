import { IRoomObject } from "../../interfaces/IRoomObject";
import { RoomLandscapeMaskSprite } from "./RoomLandscapeMaskSprite";

export interface ILandscape extends IRoomObject {
  setYLevelMasks(level: number, mask: PIXI.Sprite): void;
  setXLevelMasks(level: number, mask: PIXI.Sprite): void;
}
