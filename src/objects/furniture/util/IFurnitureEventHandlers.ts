import { IEventManagerEvent } from "../../events/interfaces/IEventManagerEvent";

export interface IFurnitureEventHandlers {
  onClick?: (event: IEventManagerEvent) => void;
  onDoubleClick?: (event: IEventManagerEvent) => void;
  onPointerDown?: (event: IEventManagerEvent) => void;
  onPointerUp?: (event: IEventManagerEvent) => void;
  onPointerOver?: (event: IEventManagerEvent) => void;
  onPointerOut?: (event: IEventManagerEvent) => void;
}
