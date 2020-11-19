import { HitEvent } from "../../../IHitDetection";

export interface IFurnitureEventHandlers {
  onClick?: (event: HitEvent) => void;
  onDoubleClick?: (event: HitEvent) => void;
}
