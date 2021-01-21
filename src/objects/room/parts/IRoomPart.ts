import { RoomPartData } from "./RoomPartData";

export interface IRoomPart {
  update(data: RoomPartData): void;
}
