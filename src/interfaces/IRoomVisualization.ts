import { RoomLandscapeMaskSprite } from "../objects/room/RoomLandscapeMaskSprite";

export interface IRoomVisualization {
  container: PIXI.Container;
  behindWallContainer: PIXI.Container;
  landscapeContainer: PIXI.Container;
  floorContainer: PIXI.Container;
  wallContainer: PIXI.Container;

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
