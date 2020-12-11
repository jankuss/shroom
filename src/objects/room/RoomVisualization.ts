import * as PIXI from "pixi.js";
import { IRoomVisualization } from "../../interfaces/IRoomVisualization";
import { RoomLandscapeMaskSprite } from "./RoomLandscapeMaskSprite";
import { Room } from "./Room";

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

  private _masksSprites: RoomLandscapeMaskSprite;

  private _landscape: PIXI.Sprite = new PIXI.TilingSprite(
    PIXI.Texture.from("./images/landscape.png"),
    1000,
    1000
  );

  constructor(room: Room, private renderer: PIXI.Renderer) {
    super();
    this._container.sortableChildren = true;
    this._behindWallPlane.sortableChildren = true;

    this._plane.addChild(this._wallPlane);
    this._plane.addChild(this._floorPlane);

    this._plane.sortableChildren = true;
    this._plane.cacheAsBitmap = true;

    this._landscapeContainer.addChild(this._landscape);

    this._landscape.x -= 500;
    this._landscape.y -= 500;

    this._masksSprites = new RoomLandscapeMaskSprite({
      width: room.roomWidth,
      height: room.roomHeight,
      renderer: this.renderer,
      wallHeight: room.wallHeight,
    });

    this._landscape.mask = this._masksSprites;

    this.addChild(this._behindWallPlane);
    this.addChild(this._plane);
    this.addChild(this._masksSprites);
    this.addChild(this._tileCursorPlane);
    this.addChild(this._landscapeContainer);
    this.addChild(this._container);
    this.addChild(this._cursorLayer);
  }

  updateRoom(room: Room) {
    this._masksSprites.updateRoom(room);
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

  addMask(element: PIXI.Sprite): void {
    this._masksSprites.addSprite(element);
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
