import * as PIXI from "pixi.js";
import { Subject } from "rxjs";
import { number } from "yargs";
import {
  IRoomVisualization,
  MaskNode,
  RoomVisualizationMeta,
} from "../../interfaces/IRoomVisualization";
import { RoomPosition } from "../../types/RoomPosition";
import { ParsedTileType, ParsedTileWall } from "../../util/parseTileMap";
import { ParsedTileMap } from "./ParsedTileMap";
import { IRoomPart } from "./parts/IRoomPart";
import { RoomPartData } from "./parts/RoomPartData";
import { Tile } from "./parts/Tile";
import { WallLeft } from "./parts/WallLeft";
import { WallRight } from "./parts/WallRight";
import { getTileMapBounds } from "./util/getTileMapBounds";

export class RoomModelVisualization
  extends PIXI.Container
  implements IRoomVisualization {
  private _positionalContainer = new PIXI.Container();
  private _behindWallLayer: PIXI.Container = new PIXI.Container();
  private _wallLayer: PIXI.Container = new PIXI.Container();
  private _tileLayer: PIXI.Container = new PIXI.Container();
  private _primaryLayer: PIXI.Container = new PIXI.Container();
  private _landscapeLayer: PIXI.Container = new PIXI.Container();

  private _walls: (WallLeft | WallRight)[] = [];
  private _tiles: Tile[] = [];

  private _borderWidth = 8;
  private _tileHeight = 8;
  private _wallHeight = 116;

  private _onActiveTileChange = new Subject<RoomPosition>();
  private _onActiveWallChange = new Subject<{
    roomX: number;
    roomY: number;
    offsetX: number;
    offsetY: number;
  }>();

  private _roomBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };

  constructor(private _parsedTileMap: ParsedTileMap) {
    super();

    this._roomBounds = getTileMapBounds(this._parsedTileMap.parsedTileTypes, {
      x: 1,
      y: 1,
    });

    this._positionalContainer.addChild(this._wallLayer);
    this._positionalContainer.addChild(this._tileLayer);
    this._positionalContainer.addChild(this._landscapeLayer);
    this._positionalContainer.addChild(this._primaryLayer);

    this._positionalContainer.x = 0;
    this._positionalContainer.y = 0;

    this.addChild(this._positionalContainer);

    this._updateHeightmap();
  }

  public get onActiveTileChange() {
    return this._onActiveTileChange.asObservable();
  }

  public get onActiveWallChange() {
    return this._onActiveWallChange.asObservable();
  }

  subscribeRoomMeta(
    listener: (value: RoomVisualizationMeta) => void
  ): { unsubscribe: () => void } {
    throw new Error("Method not implemented.");
  }

  public get container() {
    return this._primaryLayer;
  }

  public get behindWallContainer() {
    return this._behindWallLayer;
  }

  public get landscapeContainer() {
    return this._landscapeLayer;
  }

  public get floorContainer() {
    return this._tileLayer;
  }

  public get wallContainer() {
    return this._wallLayer;
  }

  addMask(id: string, element: PIXI.Sprite): MaskNode {
    return {
      remove: () => {
        return;
      },
    };
  }

  public getScreenPosition(roomX: number, roomY: number, roomZ: number) {
    return this._getPosition(roomX, roomY, roomZ);
  }

  private _getCurrentRoomPartData(): RoomPartData {
    return {
      borderWidth: this._borderWidth,
      tileHeight: this._tileHeight,
      wallHeight: this._getLargestWallHeight(),
    };
  }

  private _setCache(cache: boolean) {
    [this._tileLayer, this._wallLayer].forEach(
      (container) => (container.cacheAsBitmap = cache)
    );
  }

  private _getLargestWallHeight() {
    return this._parsedTileMap.largestDiff * 32 + this._wallHeight;
  }

  private _updateHeightmap() {
    for (let y = 0; y < this._parsedTileMap.parsedTileTypes.length; y++) {
      for (let x = 0; x < this._parsedTileMap.parsedTileTypes[y].length; x++) {
        const cell = this._parsedTileMap.parsedTileTypes[y][x];

        this._createHeightmapElement(cell, x, y);
      }
    }

    [...this._tiles, ...this._walls].forEach((tile) =>
      tile.update(this._getCurrentRoomPartData())
    );
  }

  private _createHeightmapElement(
    element: ParsedTileType,
    x: number,
    y: number
  ) {
    switch (element.type) {
      case "wall":
        this._createWallElement(element, x, y, element.height);
        break;

      case "tile":
        this._createTileElement(x, y, element.z);
        break;
    }
  }

  private _createTileElement(x: number, y: number, z: number) {
    const tile = new Tile({ color: "#eeeeee", tileHeight: 8 });
    const position = this._getPosition(x, y, z);

    tile.x = position.x;
    tile.y = position.y;

    this._tileLayer.addChild(tile);
    this._tiles.push(tile);
  }

  private _createRightWall(roomX: number, roomY: number, roomZ: number) {
    const wall = new WallRight({
      hideBorder: false,
      onMouseMove: () => {
        //
      },
    });

    const { x, y } = this._getPosition(roomX, roomY + 1, roomZ);
    wall.x = x + 32;
    wall.y = y;
    wall.roomZ = roomZ;

    this._wallLayer.addChild(wall);
    this._walls.push(wall);
  }

  private _createLeftWall(
    roomX: number,
    roomY: number,
    roomZ: number,
    hideBorder = false
  ) {
    const wall = new WallLeft({
      hideBorder,
      onMouseMove: (event) => {
        this._onActiveWallChange.next({
          roomX,
          roomY,
          offsetX: event.offsetX,
          offsetY: event.offsetY / 2 + this._wallHeight / 2,
        });
      },
    });

    const { x, y } = this._getPosition(roomX + 1, roomY, roomZ);
    wall.x = x - 8;
    wall.y = y;
    wall.roomZ = roomZ;

    this._wallLayer.addChild(wall);
    this._walls.push(wall);
  }

  private _createWallElement(
    element: ParsedTileWall,
    x: number,
    y: number,
    z: number
  ) {
    switch (element.kind) {
      case "colWall":
        this._createRightWall(x, y, z);
        break;

      case "rowWall":
        this._createLeftWall(x, y, z);
        break;

      case "innerCorner":
        this._createRightWall(x, y, z);
        this._createLeftWall(x, y, z, true);
        break;
    }
  }

  private _getPosition(
    roomX: number,
    roomY: number,
    roomZ: number
  ): { x: number; y: number } {
    const getBasePosition = () => {
      return { x: roomX, y: roomY };
    };

    const { x, y } = getBasePosition();

    const base = 32;

    // TODO: Right now we are subtracting the tileMapBounds here.
    // This is so the landscapes work correctly. This has something with the mask position being negative for some walls.
    // This fixes it for now.
    const xPos = x * base - y * base;
    const yPos = x * (base / 2) + y * (base / 2);

    return {
      x: xPos,
      y: yPos - roomZ * 32,
    };
  }
}
