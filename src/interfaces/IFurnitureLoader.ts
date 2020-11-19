import { LoadFurniResult } from "../objects/furniture/util/loadFurni";

export interface IFurnitureLoader {
  loadFurni(type: string): Promise<LoadFurniResult>;
}
