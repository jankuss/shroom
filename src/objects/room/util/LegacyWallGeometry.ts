import { ParsedTileType } from "../../../util/parseTileMap";

export class LegacyWallGeometry {
  private static readonly RIGHT_WALL: string = "l";
  private static readonly LEFT_WALL: string = "r";

  private _width: number;
  private _height: number;
  private _scale: number;

  constructor(private _heightmap: ParsedTileType[][]) {
    this._width = _heightmap[0].length;
    this._height = _heightmap.length;
    this._scale = 64;
  }

  public getLocation(
    roomX: number,
    roomY: number,
    offsetX: number,
    offsetY: number,
    wall: string
  ): { x: number; y: number; z: number } {
    let rX: number = roomX;
    let rY: number = roomY;
    let rZ: number = this.getHeight(roomX, roomY);
    if (wall == LegacyWallGeometry.LEFT_WALL) {
      rX = rX + (offsetX / (this._scale / 2) - 0.5);
      rY = rY + 0.5;
      rZ = rZ - (offsetY - offsetX / 2) / (this._scale / 2);
    } else {
      rY = rY + ((this._scale / 2 - offsetX) / (this._scale / 2) - 0.5);
      rX = rX + 0.5;
      rZ = rZ - (offsetY - (this._scale / 2 - offsetX) / 2) / (this._scale / 2);
    }
    return {
      x: rX,
      y: rY,
      z: rZ,
    };
  }

  public getHeight(x: number, y: number): number {
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) return 0;

    const row = this._heightmap[y];

    if (row == null) return 0;
    const cell = row[x];

    switch (cell.type) {
      case "wall":
        return cell.height;
      case "stairs":
        return cell.z;
      case "tile":
        return cell.z;
    }

    return 0;
  }
}
