export interface ILandscapeContainer {
  getMaskLevel(roomX: number, roomY: number): { roomX: number; roomY: number };
}
