export interface IRoomPositioned {
  getRoomObjectRect(): RoomObjectRect;
}

export type RoomObjectRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
