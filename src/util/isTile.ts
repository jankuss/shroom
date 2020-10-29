import { TileType, TileTypeNumber } from "../types/TileType";

export const isTile = (type: TileType): type is TileTypeNumber =>
  !isNaN(Number(type));
