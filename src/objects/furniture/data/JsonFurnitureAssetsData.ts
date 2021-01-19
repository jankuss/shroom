import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { FurnitureAssetsJson } from "./FurnitureAssetsJson";
import {
  FurnitureAsset,
  IFurnitureAssetsData,
} from "./interfaces/IFurnitureAssetsData";

export class JsonFurnitureAssetsData implements IFurnitureAssetsData {
  constructor(private _assets: FurnitureAssetsJson) {}

  getAsset(name: string): FurnitureAsset | undefined {
    return this._assets[name];
  }

  getAssets(): FurnitureAsset[] {
    return Object.values(this._assets).filter(notNullOrUndefined);
  }
}
