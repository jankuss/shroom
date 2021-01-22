import { LegacyAssetBundle } from "../../assets/LegacyAssetBundle";
import { ShroomAssetBundle } from "../../assets/ShroomAssetBundle";
import { IFurnitureData } from "../../interfaces/IFurnitureData";
import {
  FurnitureFetch,
  IFurnitureLoader,
} from "../../interfaces/IFurnitureLoader";
import { IFurnitureAssetBundle } from "./IFurnitureAssetBundle";
import { JsonFurnitureAssetBundle } from "./JsonFurnitureAssetBundle";
import { loadFurni, LoadFurniResult } from "./util/loadFurni";
import { XmlFurnitureAssetBundle } from "./XmlFurnitureAssetBundle";

export class FurnitureLoader implements IFurnitureLoader {
  private _furnitureCache: Map<string, Promise<LoadFurniResult>> = new Map();
  private _artificalDelay: number | undefined;
  private _assetBundles: Map<
    string,
    Promise<IFurnitureAssetBundle>
  > = new Map();

  constructor(private _options: Options) {}

  public get delay() {
    return this._artificalDelay;
  }

  public set delay(value) {
    this._artificalDelay = value;
  }

  static create(furnitureData: IFurnitureData, resourcePath = "") {
    return new FurnitureLoader({
      furnitureData,
      getAssetBundle: async (type, revision) => {
        const bundle = new LegacyAssetBundle(
          `${resourcePath}/hof_furni/${normalizePath(revision, type)}`
        );
        return new XmlFurnitureAssetBundle(type, bundle);
      },
    });
  }

  static createForJson(furnitureData: IFurnitureData, resourcePath = "") {
    return new FurnitureLoader({
      furnitureData,
      getAssetBundle: async (type, revision) => {
        const bundle = await ShroomAssetBundle.fromUrl(
          `${resourcePath}/hof_furni/${normalizePath(revision, type)}.shroom`
        );
        return new JsonFurnitureAssetBundle(bundle);
      },
    });
  }

  async loadFurni(fetch: FurnitureFetch): Promise<LoadFurniResult> {
    if (this.delay != null) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    let typeWithColor: string;

    if (fetch.kind === "id") {
      const type = await this._options.furnitureData.getTypeById(
        fetch.id,
        fetch.placementType
      );
      if (type == null)
        throw new Error("Couldn't determine type for furniture.");

      typeWithColor = type;
    } else {
      typeWithColor = fetch.type;
    }

    const typeSplitted = typeWithColor.split("*");
    const type = typeSplitted[0];

    const revision = await this._options.furnitureData.getRevisionForType(
      typeWithColor
    );

    let furniture = this._furnitureCache.get(typeWithColor);
    if (furniture != null) {
      return furniture;
    }

    furniture = loadFurni(
      typeWithColor,
      await this._getAssetBundle(type, revision)
    );
    this._furnitureCache.set(type, furniture);

    return furniture;
  }

  private _getAssetBundle(type: string, revision?: number) {
    const key = `${type}_${revision}`;
    const current = this._assetBundles.get(key);
    if (current != null) return current;

    const bundle = this._options.getAssetBundle(type, revision);
    this._assetBundles.set(key, bundle);

    return bundle;
  }
}

interface Options {
  furnitureData: IFurnitureData;
  getAssetBundle: (
    type: string,
    revision?: number
  ) => Promise<IFurnitureAssetBundle>;
}

const normalizePath = (revision: number | undefined, type: string) => {
  if (revision == null) return type;

  return `${revision}/${type}`;
};
