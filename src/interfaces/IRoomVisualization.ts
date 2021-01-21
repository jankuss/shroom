import { IRoomPart } from "../objects/room/parts/IRoomPart";
import { RoomLandscapeMaskSprite } from "../objects/room/RoomLandscapeMaskSprite";

export interface IRoomVisualization {
  container: PIXI.Container;
  behindWallContainer: PIXI.Container;
  landscapeContainer: PIXI.Container;
  floorContainer: PIXI.Container;
  wallContainer: PIXI.Container;

  addPart(part: IRoomPart): PartNode;
  addMask(id: string, element: PIXI.Sprite): MaskNode;
}

export type MaskNode = {
  sprite: PIXI.Sprite;
  update: () => void;
  remove: () => void;
};

export type PartNode = {
  remove: () => void;
};

export type RoomVisualizationMeta = {
  masks: Map<string, RoomLandscapeMaskSprite>;
  wallHeight: number;
  wallHeightWithZ: number;
};
