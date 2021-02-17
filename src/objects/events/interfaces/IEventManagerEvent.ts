import { InteractionEvent } from "pixi.js";
import { EventGroupIdentifier } from "./IEventGroup";

export interface IEventManagerEvent {
  tag?: string;
  mouseEvent: MouseEvent | TouchEvent | PointerEvent;
  interactionEvent: InteractionEvent;
  stopPropagation(): void;
  skip(...identifiers: EventGroupIdentifierParam[]): void;
  skipExcept(...identifiers: EventGroupIdentifierParam[]): void;
}

export type EventGroupIdentifierParam =
  | EventGroupIdentifierParam[]
  | EventGroupIdentifier;
