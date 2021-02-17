import { IEventManagerEvent } from "./IEventManagerEvent";

export interface IEventHandler {
  triggerClick(event: IEventManagerEvent): void;
  triggerPointerDown(event: IEventManagerEvent): void;
  triggerPointerUp(event: IEventManagerEvent): void;
  triggerPointerOver(event: IEventManagerEvent): void;
  triggerPointerOut(event: IEventManagerEvent): void;
  triggerPointerTargetChanged(event: IEventManagerEvent): void;
}
