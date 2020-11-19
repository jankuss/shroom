import { IRoomObject } from "./IRoomObject";

export interface IRoomObjectContainer {
  addRoomObject(roomObject: IRoomObject): void;
}
