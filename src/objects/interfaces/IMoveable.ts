export interface IMoveable {
  move(roomX: number, roomY: number, roomZ: number): void;
  clearMovement(): void;
}
