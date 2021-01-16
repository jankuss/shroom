import { IAssetBundle } from "../../assets/IAssetBundle";
import { FurnitureAssetsData } from "./data/FurnitureAssetsData";
import { FurnitureIndexData } from "./data/FurnitureIndexData";
import { FurnitureVisualizationData } from "./data/FurnitureVisualizationData";
import { IFurnitureAssetsData } from "./data/interfaces/IFurnitureAssetsData";
import { IFurnitureIndexData } from "./data/interfaces/IFurnitureIndexData";
import { IFurnitureVisualizationData } from "./data/interfaces/IFurnitureVisualizationData";

export class XmlFurnitureAssetBundle {
  constructor(private _type: string, private _assetBundle: IAssetBundle) {}

  async getAssets(): Promise<IFurnitureAssetsData> {
    const data = await this._assetBundle.getString(`${this._type}_assets.bin`);
    return new FurnitureAssetsData(data);
  }

  async getVisualization(): Promise<IFurnitureVisualizationData> {
    const data = await this._assetBundle.getString(
      `${this._type}_visualization.bin`
    );
    return new FurnitureVisualizationData(data);
  }

  async getTexture(name: string): Promise<Blob> {
    return this._assetBundle.getBlob(`${name}.png`);
  }

  async getIndex(): Promise<IFurnitureIndexData> {
    const data = await this._assetBundle.getString(`index.bin`);
    return new FurnitureIndexData(data);
  }
}
