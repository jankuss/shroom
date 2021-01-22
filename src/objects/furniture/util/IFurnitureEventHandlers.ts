import { HitEvent } from "../../../interfaces/IHitDetection";

export interface IFurnitureEventHandlers {
  onClick?: (event: HitEvent) => void;
  onDoubleClick?: (event: HitEvent) => void;
  onPointerDown?: (event: HitEvent) => void;
  onPointerUp?: (event: HitEvent) => void;
}
