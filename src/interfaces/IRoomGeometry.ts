export interface IRoomGeometry {
  getPosition(
    roomX: number,
    roomY: number,
    roomZ: number,
    type: "plane" | "object"
  ): { x: number; y: number };
}
