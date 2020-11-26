import { IFurnitureEventHandlers } from "./util/IFurnitureEventHandlers";

export interface IFurniture<T extends IFurniture<any> = any>
  extends IFurnitureEventHandlers {
  roomX: number;
  roomY: number;
  roomZ: number;
  direction: number;
  animation: string | undefined;
}

export type IFurnitureBehavior<T extends IFurniture<any> = any> = {
  setParent(furniture: T): void;
};
