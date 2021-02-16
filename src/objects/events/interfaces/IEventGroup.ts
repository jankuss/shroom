export interface IEventGroup {
  getEventGroupIdentifier(): EventGroupIdentifier;
}

export type EventGroupIdentifier =
  | typeof FURNITURE_EVENT
  | typeof AVATAR_EVENT
  | typeof TILE_CURSOR_EVENT;

export const FURNITURE_EVENT = Symbol("FURNITURE");
export const AVATAR_EVENT = Symbol("AVATAR");
export const TILE_CURSOR_EVENT = Symbol("TILE_CURSOR");
