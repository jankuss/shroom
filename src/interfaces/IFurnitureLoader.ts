import { LoadFurniResult } from "./util/furniture/loadFurni";

export interface IFurnitureLoader {
  loadFurni(type: string): Promise<LoadFurniResult>;
}
