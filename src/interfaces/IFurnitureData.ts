import { IFurniture } from "../objects/furniture/IFurniture";
import { furnitureDataTransformers } from "../util/furnitureDataTransformers";

export interface IFurnitureData {
  getRevisionForType(type: string): Promise<number | undefined>;
  getInfo(type: string): Promise<FurnitureInfo | undefined>;
  getInfoForFurniture(
    furniture: IFurniture
  ): Promise<FurnitureInfo | undefined>;
}

export type FurnitureInfo = {
  [key in keyof typeof furnitureDataTransformers]: ReturnType<
    typeof furnitureDataTransformers[key]
  >;
};
