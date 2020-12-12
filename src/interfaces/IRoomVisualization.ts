import { RoomLandscapeMaskSprite } from "../objects/room/RoomLandscapeMaskSprite";

export interface IRoomVisualization {
  addFloorChild(element: PIXI.DisplayObject): void;
  addWallChild(element: PIXI.DisplayObject): void;
  addBehindWallChild(element: PIXI.DisplayObject): void;
  addContainerChild(element: PIXI.DisplayObject): void;
  addTileCursorChild(element: PIXI.DisplayObject): void;

  removeBehindWallChild(element: PIXI.DisplayObject): void;
  removeContainerChild(element: PIXI.DisplayObject): void;

  addCursorChild(element: PIXI.DisplayObject): void;
  addLandscape(element: PIXI.DisplayObject): void;

  addMask(id: string, element: PIXI.Sprite): MaskNode;
  subscribeRoomMeta(
    listener: (value: RoomVisualizationMeta) => void
  ): { unsubscribe: () => void };
}

export type MaskNode = {
  remove: () => void;
};

export type RoomVisualizationMeta = {
  masks: Map<string, RoomLandscapeMaskSprite>;
  wallHeight: number;
  wallHeightWithZ: number;
};
