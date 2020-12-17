import * as PIXI from "pixi.js";
import {
  IRoomVisualization,
  MaskNode,
  RoomVisualizationMeta,
} from "../../interfaces/IRoomVisualization";
import { RoomLandscapeMaskSprite } from "./RoomLandscapeMaskSprite";
import { Room } from "./Room";
import { BehaviorSubject } from "rxjs";

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

  private _roomVisualizationMetaSubject: BehaviorSubject<RoomVisualizationMeta>;

  public get masks() {
    return this._roomVisualizationMetaSubject.value.masks;
  }

  subscribeRoomMeta(
    listener: (value: RoomVisualizationMeta) => void
  ): { unsubscribe: () => void } {
    const subscription = this._roomVisualizationMetaSubject.subscribe((value) =>
      listener(value)
    );

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }

  constructor(private room: Room, private renderer: PIXI.Renderer) {
    super();
    this._roomVisualizationMetaSubject = new BehaviorSubject({
      masks: new Map(),
      wallHeight: room.wallHeight,
      wallHeightWithZ: room.wallHeightWithZ,
    });

    this._container.sortableChildren = true;
    this._behindWallPlane.sortableChildren = true;

    this._plane.addChild(this._wallPlane);
    this._plane.addChild(this._floorPlane);

    this._plane.sortableChildren = true;
    this._plane.cacheAsBitmap = true;

    this.addChild(this._behindWallPlane);
    this.addChild(this._plane);
    this.addChild(this._landscapeContainer);
    this.addChild(this._tileCursorPlane);
    this.addChild(this._container);
    this.addChild(this._cursorLayer);
  }

  private _updateRoomVisualizationMeta(meta: Partial<RoomVisualizationMeta>) {
    this._roomVisualizationMetaSubject.next({
      masks: this.masks,
      wallHeight: this.room.wallHeight,
      wallHeightWithZ: this.room.wallHeightWithZ,
      ...meta,
    });
  }

  addMask(id: string, element: PIXI.Sprite): MaskNode {
    const existing = this.masks.get(id);
    const current =
      this.masks.get(id) ??
      new RoomLandscapeMaskSprite({
        renderer: this.renderer,
        width: this.room.roomWidth,
        height: this.room.roomHeight,
        wallHeight: this.room.wallHeight,
      });

    current.addSprite(element);
    //this._container.addChild(current);

    this._container.addChild(element);

    if (existing == null) {
      this.masks.set(id, current);
      this._updateRoomVisualizationMeta({ masks: this.masks });
    }

    return {
      remove: () => current.removeSprite(element),
    };
  }

  addLandscape(element: PIXI.DisplayObject): void {
    this._landscapeContainer.addChild(element);
  }

  updateRoom(room: Room) {
    this.room = room;
    this.masks.forEach((mask) => mask.updateRoom(room));
    this._updateRoomVisualizationMeta({
      masks: this.masks,
      wallHeight: this.room.wallHeight,
      wallHeightWithZ: this.room.wallHeightWithZ,
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
