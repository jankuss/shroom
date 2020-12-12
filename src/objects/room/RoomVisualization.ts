import * as PIXI from "pixi.js";
import {
  IRoomVisualization,
  MaskNode,
} from "../../interfaces/IRoomVisualization";
import { RoomLandscapeMaskSprite } from "./RoomLandscapeMaskSprite";
import { Room } from "./Room";
import { getLeftMatrix, getRightMatrix } from "./matrixes";

export class RoomVisualization
  extends PIXI.Container
  implements IRoomVisualization {
  private _container: PIXI.Container = new PIXI.Container();
  private _cursorLayer: PIXI.Container = new PIXI.Container();
  private _plane: PIXI.Container = new PIXI.Container();

  private _behindWallPlane: PIXI.Container = new PIXI.Container();
  private _floorPlane: PIXI.Container = new PIXI.Container();
  private _wallPlane: PIXI.Container = new PIXI.Container();
  private _tileCursorPlane: PIXI.Container = new PIXI.Container();
  private _landscapeContainer: PIXI.Container = new PIXI.Container();

  private _masksContainer = new PIXI.Container();
  private _xLevelMask = new Map<number, RoomLandscapeMaskSprite>();
  private _yLevelMask = new Map<number, RoomLandscapeMaskSprite>();

  constructor(private room: Room, private renderer: PIXI.Renderer) {
    super();
    this._container.sortableChildren = true;
    this._behindWallPlane.sortableChildren = true;

    this._plane.addChild(this._wallPlane);
    this._plane.addChild(this._floorPlane);

    this._plane.sortableChildren = true;
    this._plane.cacheAsBitmap = true;

    //this._landscape.mask = this._masksSprites;

    this.addChild(this._behindWallPlane);
    this.addChild(this._plane);
    this.addChild(this._masksContainer);
    this.addChild(this._tileCursorPlane);
    this.addChild(this._landscapeContainer);
    this.addChild(this._container);
    this.addChild(this._cursorLayer);
  }

  addXLevelMask(level: number, element: PIXI.Sprite): MaskNode {
    const current =
      this._xLevelMask.get(level) ??
      new RoomLandscapeMaskSprite({
        renderer: this.renderer,
        width: this.room.roomWidth,
        height: this.room.roomHeight,
        wallHeight: this.room.wallHeight,
      });

    current.addSprite(element);
    this._masksContainer.addChild(current);

    this._xLevelMask.set(level, current);
    this.updateRoom(this.room);

    return {
      remove: () => current.removeSprite(element),
    };
  }

  addYLevelMask(level: number, element: PIXI.Sprite): MaskNode {
    const current =
      this._yLevelMask.get(level) ??
      new RoomLandscapeMaskSprite({
        renderer: this.renderer,
        width: this.room.roomWidth,
        height: this.room.roomHeight,
        wallHeight: this.room.wallHeight,
      });

    current.addSprite(element);
    this._masksContainer.addChild(current);

    this._yLevelMask.set(level, current);
    this.updateRoom(this.room);

    return {
      remove: () => current.removeSprite(element),
    };
  }

  addLandscape(element: PIXI.DisplayObject): void {
    this._landscapeContainer.addChild(element);
  }

  updateRoom(room: Room) {
    this._yLevelMask.forEach((mask, level) => {
      mask.updateRoom(room);
      room.landscape?.setYLevelMasks(level, mask);
    });
    this._xLevelMask.forEach((mask, level) => {
      mask.updateRoom(room);
      room.landscape?.setXLevelMasks(level, mask);
    });
  }

  addTileCursorChild(element: PIXI.DisplayObject): void {
    this._tileCursorPlane.addChild(element);
  }

  removeBehindWallChild(element: PIXI.DisplayObject): void {
    this._behindWallPlane.removeChild(element);
  }

  removeContainerChild(element: PIXI.DisplayObject): void {
    this._container.removeChild(element);
  }

  addBehindWallChild(element: PIXI.DisplayObject): void {
    this._behindWallPlane.addChild(element);
  }

  addWallChild(element: PIXI.DisplayObject): void {
    this._wallPlane.addChild(element);
  }

  addCursorChild(element: PIXI.DisplayObject): void {
    this._cursorLayer.addChild(element);
  }

  disableCache() {
    this._plane.cacheAsBitmap = false;
  }

  enableCache() {
    this._plane.cacheAsBitmap = true;
  }

  addFloorChild(element: PIXI.DisplayObject): void {
    this._floorPlane.addChild(element);
  }

  addContainerChild(element: PIXI.DisplayObject): void {
    this._container.addChild(element);
  }
}
