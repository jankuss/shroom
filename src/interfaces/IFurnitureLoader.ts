import { LoadFurniResult } from "../objects/furniture/util/loadFurni";
import { FurnitureId } from "./IFurnitureData";

export interface IFurnitureLoader {
  loadFurni(type: FurnitureFetch): Promise<LoadFurniResult>;
}

export type FurnitureFetch =
  | { kind: "id"; id: FurnitureId; placementType: "wall" | "floor" }
  | { kind: "type"; type: string };
