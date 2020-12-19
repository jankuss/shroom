import { FurnitureId } from "../../interfaces/IFurnitureData";
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
}

export type IFurnitureBehavior<T extends IFurniture = IFurniture> = {
  setParent(furniture: T): void;
};
