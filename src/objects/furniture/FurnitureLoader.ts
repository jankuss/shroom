import { IFurnitureData } from "../../interfaces/IFurnitureData";
import { IFurnitureLoader } from "../../interfaces/IFurnitureLoader";
import { loadFurni, LoadFurniResult } from "./util/loadFurni";

export class FurnitureLoader implements IFurnitureLoader {
  private furnitureCache: Map<string, Promise<LoadFurniResult>> = new Map();

  constructor(
    private options: {
      furnitureData: IFurnitureData;
      getAssets: (type: string, revision: number) => Promise<string>;
      getVisualization: (type: string, revision: number) => Promise<string>;
      getAsset: (
        type: string,
        name: string,
        revision: number
      ) => Promise<string>;
    }
  ) {}

  static create(furnitureData: IFurnitureData, resourcePath: string = "") {
    return new FurnitureLoader({
      furnitureData,
      getAssets: (type, revision) =>
        fetch(
          `${resourcePath}/hof_furni/${revision}/${type}/${type}_assets.bin`
        ).then((response) => response.text()),
      getVisualization: (type, revision) =>
        fetch(
          `${resourcePath}/hof_furni/${revision}/${type}/${type}_visualization.bin`
        ).then((response) => response.text()),
      getAsset: async (type, name, revision) =>
        `${resourcePath}/hof_furni/${revision}/${type}/${name}.png`,
    });
  }

  async loadFurni(typeWithColor: string): Promise<LoadFurniResult> {
    const type = typeWithColor.split("*")[0];
    const revision = await this.options.furnitureData.getRevisionForType(
      typeWithColor
    );

    let furniture = this.furnitureCache.get(type);
    if (furniture != null) {
      return furniture;
    }

    if (revision == null) {
      throw new Error("Couldn't find revision for type " + typeWithColor);
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
