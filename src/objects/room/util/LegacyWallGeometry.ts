import { ParsedTileType } from "../../../util/parseTileMap";

export class LegacyWallGeometry {
  private static readonly L: string = "l";
  private static readonly R: string = "r";

  private _width: number;
  private _height: number;
  private _scale: number;

  constructor(
    private _heightmap: ParsedTileType[][],
    private _floorHeight: number
  ) {
    this._width = _heightmap[0].length;
    this._height = _heightmap.length;
    this._scale = 64;
  }

  public getLocation(
    k: number,
    _arg_2: number,
    _arg_3: number,
    _arg_4: number,
    _arg_5: string
  ): { x: number; y: number; z: number } {
    let _local_8: number = k;
    let _local_9: number = _arg_2;
    let _local_10: number = this.getHeight(k, _arg_2);
    if (_arg_5 == LegacyWallGeometry.R) {
      _local_8 = _local_8 + (_arg_3 / (this._scale / 2) - 0.5);
      _local_9 = _local_9 + 0.5;
      _local_10 = _local_10 - (_arg_4 - _arg_3 / 2) / (this._scale / 2);
    } else {
      _local_9 =
        _local_9 + ((this._scale / 2 - _arg_3) / (this._scale / 2) - 0.5);
      _local_8 = _local_8 + 0.5;
      _local_10 =
        _local_10 -
        (_arg_4 - (this._scale / 2 - _arg_3) / 2) / (this._scale / 2);
    }
    return {
      x: _local_8,
      y: _local_9,
      z: _local_10,
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
