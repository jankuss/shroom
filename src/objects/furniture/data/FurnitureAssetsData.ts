import { XmlData } from "../../../data/XmlData";
import { FurnitureAssetsJson } from "./FurnitureAssetsJson";
import {
  FurnitureAsset,
  IFurnitureAssetsData,
} from "./interfaces/IFurnitureAssetsData";

export class FurnitureAssetsData
  extends XmlData
  implements IFurnitureAssetsData {
  private _assets = new Map<string, FurnitureAsset>();

  constructor(xml: string) {
    super(xml);

    this.querySelectorAll("asset").forEach((element) => {
      const name = element.getAttribute("name");
      const x = Number(element.getAttribute("x"));
      const y = Number(element.getAttribute("y"));
      const source = element.getAttribute("source");
      const flipH = element.getAttribute("flipH") === "1";

      if (name == null) throw new Error("Invalid name");
      if (isNaN(x)) throw new Error("x is not a number");
      if (isNaN(y)) throw new Error("y is not a number");

      this._assets.set(name, {
        x,
        y,
        source: source ?? undefined,
        flipH,
        name,
        valid: true,
      });
    });
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new FurnitureAssetsData(text);
  }

  toJson(): FurnitureAssetsJson {
    const assets = this.getAssets();
    const assetsObject: { [key: string]: FurnitureAsset } = {};

    assets.forEach((asset) => {
      assetsObject[asset.name] = asset;
    });

    return assetsObject;
  }

  getAsset(name: string): FurnitureAsset | undefined {
    return this._assets.get(name);
  }

  getAssets() {
    return Array.from(this._assets.values());
  }
}
