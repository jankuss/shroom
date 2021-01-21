import * as PIXI from "pixi.js";

import { IAssetBundle } from "../../assets/IAssetBundle";
import { loadImageFromBlob } from "../../util/loadImageFromBlob";
import { loadImageFromUrl } from "../../util/loadImageFromUrl";
import { HitTexture } from "../hitdetection/HitTexture";
import { FurnitureJson } from "./data/FurnitureJson";
import { IFurnitureAssetsData } from "./data/interfaces/IFurnitureAssetsData";
import { IFurnitureIndexData } from "./data/interfaces/IFurnitureIndexData";
import { IFurnitureVisualizationData } from "./data/interfaces/IFurnitureVisualizationData";
import { JsonFurnitureAssetsData } from "./data/JsonFurnitureAssetsData";
import { JsonFurnitureVisualizationData } from "./data/JsonFurnitureVisualizationData";
import { IFurnitureAssetBundle } from "./IFurnitureAssetBundle";

export class JsonFurnitureAssetBundle implements IFurnitureAssetBundle {
  private _data: Promise<{
    assets: IFurnitureAssetsData;
    visualization: IFurnitureVisualizationData;
    index: IFurnitureIndexData;
    spritesheet: PIXI.Spritesheet;
  }>;

  constructor(private _assetBundle: IAssetBundle) {
    this._data = this._load();
  }

  async getAssets(): Promise<IFurnitureAssetsData> {
    const { assets } = await this._data;

    return assets;
  }

  async getVisualization(): Promise<IFurnitureVisualizationData> {
    const { visualization } = await this._data;

    return visualization;
  }

  async getTexture(name: string): Promise<HitTexture> {
    const { spritesheet } = await this._data;

    return HitTexture.fromSpriteSheet(spritesheet, name);
  }

  async getIndex(): Promise<IFurnitureIndexData> {
    const { index } = await this._data;

    return index;
  }

  private async _load() {
    const json: FurnitureJson = JSON.parse(
      await this._assetBundle.getString("index.json")
    );

    const blob = await this._assetBundle.getBlob("spritesheet.png");
    const imageUrl = await loadImageFromBlob(blob);
    const baseTextureImage = await loadImageFromUrl(imageUrl);

    const baseTexture = PIXI.BaseTexture.from(baseTextureImage);

    const spritesheet = new PIXI.Spritesheet(baseTexture, json.spritesheet);

    await new Promise<void>((resolve) => {
      spritesheet.parse(() => {
        resolve();
      });
    });

    return {
      assets: new JsonFurnitureAssetsData(json.assets),
      visualization: new JsonFurnitureVisualizationData(json.visualization),
      index: json.index,
      spritesheet,
    };
  }
}
