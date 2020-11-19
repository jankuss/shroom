export interface IRoomGeometry {
  getPosition(
    roomX: number,
    roomY: number,
    roomZ: number
  ): { x: number; y: number };
}
