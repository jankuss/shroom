import { FurnitureId } from "../../interfaces/IFurnitureData";
import { FurnitureExtraData } from "./FurnitureExtraData";
import { IFurnitureVisualization } from "./IFurnitureVisualization";
import { IFurnitureEventHandlers } from "./util/IFurnitureEventHandlers";

export interface IFurniture extends IFurnitureEventHandlers {
  id: FurnitureId | undefined;
  type: string | undefined;
  roomX: number;
  roomY: number;
  roomZ: number;
  direction: number;
  animation: string | undefined;
  highlight: boolean | undefined;
  placementType: "wall" | "floor";
  alpha: number;
  extradata: Promise<FurnitureExtraData>;
  validDirections: Promise<number[]>;
  visualization: IFurnitureVisualization;
}

export type IFurnitureBehavior<T extends IFurniture = IFurniture> = {
  setParent(furniture: T): void;
};
