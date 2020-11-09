import { IFurnitureLoader } from "../../IFurnitureLoader";
import { loadFurni, LoadFurniResult } from "./util/loadFurni";

export class FurnitureLoader implements IFurnitureLoader {
  private furnitureCache: Map<string, Promise<LoadFurniResult>> = new Map();

  constructor(
    private options: {
      getAssets: (type: string) => Promise<string>;
      getVisualization: (type: string) => Promise<string>;
      getAsset: (type: string, name: string) => Promise<string>;
    }
  ) {}

  static create(resourcePath: string = "") {
    return new FurnitureLoader({
      getAssets: (type) =>
        fetch(
          `${resourcePath}/hof_furni/${type}/${type}_assets.bin`
        ).then((response) => response.text()),
      getVisualization: (type) =>
        fetch(
          `${resourcePath}/hof_furni/${type}/${type}_visualization.bin`
        ).then((response) => response.text()),
      getAsset: async (type, name) => `./hof_furni/${type}/${name}.png`,
    });
  }

  async loadFurni(typeWithColor: string): Promise<LoadFurniResult> {
    const type = typeWithColor.split("*")[0];

    const current = this.furnitureCache.get(type);
    if (current != null) return current;

    let furniture = this.furnitureCache.get(type);

    if (furniture != null) {
      return furniture;
    }

    furniture = loadFurni(type, {
      getAssets: this.options.getAssets,
      getVisualization: this.options.getVisualization,
      getAsset: this.options.getAsset,
    });
    this.furnitureCache.set(type, furniture);

    return furniture;
  }
}
