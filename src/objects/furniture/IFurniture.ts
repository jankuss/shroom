import { IFurnitureEventHandlers } from "./util/IFurnitureEventHandlers";

export interface IFurniture extends IFurnitureEventHandlers {
  roomX: number;
  roomY: number;
  roomZ: number;
  direction: number;
  animation: string | undefined;
}

export type IFurnitureBehavior<T extends IFurniture> = {
  setParent(furniture: T): void;
};
