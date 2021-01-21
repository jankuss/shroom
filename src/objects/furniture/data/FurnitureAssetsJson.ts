import { FurnitureAsset } from "./interfaces/IFurnitureAssetsData";

export interface FurnitureAssetsJson {
  [key: string]: FurnitureAsset | undefined;
}
