import { EventGroupIdentifier } from "./IEventGroup";

export interface IEventManagerEvent {
  tag?: string;
  stopPropagation(): void;
  skip(identifiers: EventGroupIdentifier[]): void;
}
