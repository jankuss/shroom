export interface IEventGroup {
  getEventGroupIdentifier(): EventGroupIdentifier;
}

export type EventGroupIdentifier =
  | typeof FURNITURE
  | typeof AVATAR
  | typeof TILE_CURSOR
  | typeof WALL;

export const FURNITURE = Symbol("FURNITURE");
export const AVATAR = Symbol("AVATAR");
export const TILE_CURSOR = Symbol("TILE_CURSOR");
export const WALL = Symbol("WALL");
