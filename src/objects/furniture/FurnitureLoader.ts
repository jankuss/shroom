import { IFurnitureData } from "../../interfaces/IFurnitureData";
import {
  FurnitureFetch,
  IFurnitureLoader,
} from "../../interfaces/IFurnitureLoader";
import { loadFurni, LoadFurniResult } from "./util/loadFurni";

export class FurnitureLoader implements IFurnitureLoader {
  private furnitureCache: Map<string, Promise<LoadFurniResult>> = new Map();

  constructor(
    private options: {
      furnitureData: IFurnitureData;
      getAssets: (type: string, revision?: number) => Promise<string>;
      getVisualization: (type: string, revision?: number) => Promise<string>;
      getAsset: (
        type: string,
        name: string,
        revision?: number
      ) => Promise<string>;
    }
  ) {}

  static create(furnitureData: IFurnitureData, resourcePath: string = "") {
    const normalizePath = (revision: number | undefined, type: string) => {
      if (revision == null) return type;

      return `${revision}/${type}`;
    };

    return new FurnitureLoader({
      furnitureData,
      getAssets: (type, revision) =>
        fetch(
          `${resourcePath}/hof_furni/${normalizePath(
            revision,
            type
          )}/${type}_assets.bin`
        ).then((response) => response.text()),
      getVisualization: (type, revision) =>
        fetch(
          `${resourcePath}/hof_furni/${normalizePath(
            revision,
            type
          )}/${type}_visualization.bin`
        ).then((response) => response.text()),
      getAsset: async (type, name, revision) =>
        `${resourcePath}/hof_furni/${normalizePath(
          revision,
          type
        )}/${name}.png`,
    });
  }

  async loadFurni(fetch: FurnitureFetch): Promise<LoadFurniResult> {
    let typeWithColor: string;

    if (fetch.kind === "id") {
      const type = await this.options.furnitureData.getTypeById(
        fetch.id,
        fetch.placementType
      );
      if (type == null)
        throw new Error("Couldn't determine type for furniture.");

      typeWithColor = type;
    } else {
      typeWithColor = fetch.type;
    }

    const type = typeWithColor.split("*")[0];
    const revision = await this.options.furnitureData.getRevisionForType(
      typeWithColor
    );

    let furniture = this.furnitureCache.get(type);
    if (furniture != null) {
      return furniture;
    }

    furniture = loadFurni(type, revision, {
      getAssets: this.options.getAssets,
      getVisualization: this.options.getVisualization,
      getAsset: this.options.getAsset,
    });
    this.furnitureCache.set(type, furniture);

    return furniture;
  }
}
