import { EventGroupIdentifier } from "./IEventGroup";

export interface IEventManagerEvent {
  tag?: string;
  stopPropagation(): void;
  skip(...identifiers: EventGroupIdentifierParam[]): void;
  skipExcept(...identifiers: EventGroupIdentifierParam[]): void;
}

export type EventGroupIdentifierParam =
  | EventGroupIdentifierParam[]
  | EventGroupIdentifier;
