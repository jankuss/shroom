import { HitEvent } from "../../../interfaces/IHitDetection";

export interface IFurnitureEventHandlers {
  onClick?: (event: HitEvent) => void;
  onDoubleClick?: (event: HitEvent) => void;
}
