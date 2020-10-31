import { IFurnitureLoader } from "../../IFurnitureLoader";
import { loadFurni, LoadFurniResult } from "../../util/furniture/loadFurni";

export class FurnitureLoader implements IFurnitureLoader {
  private furnitureCache: Map<string, Promise<LoadFurniResult>> = new Map();

  async loadFurni(typeWithColor: string): Promise<LoadFurniResult> {
    const type = typeWithColor.split("*")[0];

    const current = this.furnitureCache.get(type);
    if (current != null) return current;

    let furniture = this.furnitureCache.get(type);

    if (furniture != null) {
      return furniture;
    }

    furniture = loadFurni(type);
    this.furnitureCache.set(type, furniture);

    return furniture;
  }
}
