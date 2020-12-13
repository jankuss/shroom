import { ParsedTileType } from "../util/parseTileMap";

export interface ITileMap {
  getTileAtPosition(roomX: number, roomY: number): ParsedTileType | undefined;
  getParsedTileTypes(): ParsedTileType[][];
}
