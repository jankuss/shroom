import { IFurnitureEventHandlers } from "./util/IFurnitureEventHandlers";

export interface IFurniture extends IFurnitureEventHandlers {
  type: string;
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
