import { IFurnitureData } from "../../interfaces/IFurnitureData";
import {
  FurnitureFetch,
  IFurnitureLoader,
} from "../../interfaces/IFurnitureLoader";
import { FurnitureAssetsData } from "./data/FurnitureAssetsData";
import { FurnitureIndexData } from "./data/FurnitureIndexData";
import { FurnitureVisualizationData } from "./data/FurnitureVisualizationData";
import { IFurnitureAssetsData } from "./data/interfaces/IFurnitureAssetsData";
import { IFurnitureIndexData } from "./data/interfaces/IFurnitureIndexData";
import { IFurnitureVisualizationData } from "./data/interfaces/IFurnitureVisualizationData";
import { loadFurni, LoadFurniResult } from "./util/loadFurni";

export class FurnitureLoader implements IFurnitureLoader {
  private _furnitureCache: Map<string, Promise<LoadFurniResult>> = new Map();
  private _artificalDelay: number | undefined;

  constructor(private _options: Options) {}

  public get delay() {
    return this._artificalDelay;
  }

  public set delay(value) {
    this._artificalDelay = value;
  }

  static create(furnitureData: IFurnitureData, resourcePath = "") {
    const normalizePath = (revision: number | undefined, type: string) => {
      if (revision == null) return type;

      return `${revision}/${type}`;
    };

    return new FurnitureLoader({
      furnitureData,
      getAssets: (type, revision) => {
        const assetsPath = `${resourcePath}/hof_furni/${normalizePath(
          revision,
          type
        )}/${type}_assets.bin`;

        return FurnitureAssetsData.fromUrl(assetsPath);
      },
      getVisualization: (type, revision) => {
        const visualizationPath = `${resourcePath}/hof_furni/${normalizePath(
          revision,
          type
        )}/${type}_visualization.bin`;

        return FurnitureVisualizationData.fromUrl(visualizationPath);
      },
      getTextureUrl: async (type, name, revision) => {
        return `${resourcePath}/hof_furni/${normalizePath(
          revision,
          type
        )}/${name}.png`;
      },
      getIndex: async (type, revision) => {
        const indexPath = `${resourcePath}/hof_furni/${normalizePath(
          revision,
          type
        )}/index.bin`;

        return FurnitureIndexData.fromUrl(indexPath);
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

    furniture = loadFurni(typeWithColor, revision, {
      getAssets: this._options.getAssets,
      getVisualization: this._options.getVisualization,
      getTextureUrl: this._options.getTextureUrl,
      getIndex: this._options.getIndex,
    });
    this._furnitureCache.set(type, furniture);

    return furniture;
  }
}

interface Options {
  furnitureData: IFurnitureData;
  getAssets: (type: string, revision?: number) => Promise<IFurnitureAssetsData>;
  getVisualization: (
    type: string,
    revision?: number
  ) => Promise<IFurnitureVisualizationData>;
  getTextureUrl: (
    type: string,
    name: string,
    revision?: number
  ) => Promise<string>;
  getIndex: (type: string, revision?: number) => Promise<IFurnitureIndexData>;
}
