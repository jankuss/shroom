import { RoomLandscapeMaskSprite } from "../objects/room/RoomLandscapeMaskSprite";

export interface IRoomVisualization {
  addMask(id: string, element: PIXI.Sprite): MaskNode;
  subscribeRoomMeta(
    listener: (value: RoomVisualizationMeta) => void
  ): { unsubscribe: () => void };

  container: PIXI.Container;
  behindWallContainer: PIXI.Container;
  landscapeContainer: PIXI.Container;
  floorContainer: PIXI.Container;
  wallContainer: PIXI.Container;
}

export type MaskNode = {
  remove: () => void;
};

export type RoomVisualizationMeta = {
  masks: Map<string, RoomLandscapeMaskSprite>;
  wallHeight: number;
  wallHeightWithZ: number;
};
