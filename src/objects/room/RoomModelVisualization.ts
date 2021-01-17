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
import { IRoomRectangle, Rectangle } from "./IRoomRectangle";
import { ParsedTileMap } from "./ParsedTileMap";
import { IRoomPart } from "./parts/IRoomPart";
import { RoomPartData } from "./parts/RoomPartData";
import { Tile } from "./parts/Tile";
import { WallLeft } from "./parts/WallLeft";
import { WallOuterCorner } from "./parts/WallOuterCorner";
import { WallRight } from "./parts/WallRight";
import { TileCursor } from "./TileCursor";
import { getTileMapBounds } from "./util/getTileMapBounds";

export class RoomModelVisualization
  extends PIXI.Container
  implements IRoomVisualization, IRoomRectangle {
  private _wallLeftColor: number | undefined;
  private _wallRightColor: number | undefined;
  private _wallTopColor: number | undefined;

  private _tileLeftColor: number | undefined;
  private _tileRightColor: number | undefined;
  private _tileTopColor: number | undefined;

  private _positionalContainer = new PIXI.Container();
  private _behindWallLayer: PIXI.Container = new PIXI.Container();
  private _wallLayer: PIXI.Container = new PIXI.Container();
  private _tileLayer: PIXI.Container = new PIXI.Container();
  private _primaryLayer: PIXI.Container = new PIXI.Container();
  private _landscapeLayer: PIXI.Container = new PIXI.Container();
  private _wallHitAreaLayer: PIXI.Container = new PIXI.Container();

  private _walls: (WallLeft | WallRight | WallOuterCorner)[] = [];
  private _tiles: Tile[] = [];
  private _tileCursors: TileCursor[] = [];

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

  private _tileMapBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };

  private _refreshRoom = false;

  constructor(private _parsedTileMap: ParsedTileMap) {
    super();

    this._tileMapBounds = getTileMapBounds(
      this._parsedTileMap.parsedTileTypes,
      {
        x: 1,
        y: 1,
      }
    );

    this._positionalContainer.addChild(this._behindWallLayer);
    this._positionalContainer.addChild(this._wallLayer);
    this._positionalContainer.addChild(this._wallHitAreaLayer);
    this._positionalContainer.addChild(this._tileLayer);
    this._positionalContainer.addChild(this._landscapeLayer);
    this._positionalContainer.addChild(this._primaryLayer);

    this._positionalContainer.x = -this.roomBounds.minX;
    this._positionalContainer.y = -this.roomBounds.minY;
    this._primaryLayer.sortableChildren = true;

    this.addChild(this._positionalContainer);

    this._updateHeightmap();
  }

  public get roomBounds() {
    return {
      minX: this._tileMapBounds.minX - this._borderWidth,
      maxX: this._tileMapBounds.maxX + this._borderWidth,
      minY: this._tileMapBounds.minY - this._borderWidth - this._wallHeight,
      maxY: this._tileMapBounds.maxY + this._tileHeight,
    };
  }

  public get rectangle(): Rectangle {
    return {
      x: this.x,
      y: this.y,
      width: this.roomBounds.maxX - this.roomBounds.minX,
      height: this.roomBounds.maxY - this.roomBounds.minY,
    };
  }

  public get wallLeftColor() {
    return this._wallLeftColor;
  }

  public set wallLeftColor(value) {
    this._wallLeftColor = value;
    this._refreshRoom = true;
  }

  public get wallRightColor() {
    return this._wallRightColor;
  }

  public set wallRightColor(value) {
    this._wallRightColor = value;
    this._refreshRoom = true;
  }

  public get wallTopColor() {
    return this._wallLeftColor;
  }

  public set wallTopColor(value) {
    this._wallLeftColor = value;
    this._refreshRoom = true;
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
      wallLeftColor: this._wallLeftColor ?? 0x91949f,
      wallRightColor: this._wallRightColor ?? 0xbbbecd,
      wallTopColor: this._wallTopColor ?? 0x70727b,
      tileLeftColor: this._tileLeftColor ?? 0x838357,
      tileRightColor: this._tileRightColor ?? 0x666644,
      tileTopColor: this._tileTopColor ?? 0x989865,
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
    this._setCache(false);
    for (let y = 0; y < this._parsedTileMap.parsedTileTypes.length; y++) {
      for (let x = 0; x < this._parsedTileMap.parsedTileTypes[y].length; x++) {
        const cell = this._parsedTileMap.parsedTileTypes[y][x];

        this._createHeightmapElement(cell, x, y);
      }
    }

    [...this._tiles, ...this._walls].forEach((tile) =>
      tile.update(this._getCurrentRoomPartData())
    );

    this._setCache(true);
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

      case "door":
        this._createDoor(x, y, element.z);
        break;
    }
  }

  private _createDoor(x: number, y: number, z: number) {
    this._createTileElement(x, y, z, this._behindWallLayer);
    this._createLeftWall(x, y, z, { hideBorder: false, cutawayHeight: 90 });
  }

  private _createTileElement(
    x: number,
    y: number,
    z: number,
    container?: PIXI.Container
  ) {
    const tile = new Tile({ color: "#eeeeee", tileHeight: 8 });
    const position = this._getPosition(x, y, z);

    tile.x = position.x;
    tile.y = position.y;

    (container ?? this._tileLayer).addChild(tile);
    this._tiles.push(tile);

    this._createTileCursor(x, y, z);
  }

  private _createTileCursor(x: number, y: number, z: number) {
    // TODO: Create tile cursor
  }

  private _createRightWall(roomX: number, roomY: number, roomZ: number) {
    const wall = new WallRight({
      hideBorder: false,
      onMouseMove: () => {
        //
      },
      hitAreaContainer: this._wallHitAreaLayer,
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
    {
      hideBorder = false,
      cutawayHeight,
    }: { hideBorder?: boolean; cutawayHeight?: number }
  ) {
    const wall = new WallLeft({
      hideBorder,
      onMouseMove: (event) => {
        this._onActiveWallChange.next({
          roomX,
          roomY,
          offsetX: event.offsetX,
          offsetY: event.offsetY / 2 + this._wallHeight / 2 - event.offsetX / 4,
        });
      },
      hitAreaContainer: this._wallHitAreaLayer,
      cutawayHeight: cutawayHeight,
    });

    const { x, y } = this._getPosition(roomX + 1, roomY, roomZ);
    wall.x = x - this._borderWidth;
    wall.y = y;
    wall.roomZ = roomZ;

    this._wallLayer.addChild(wall);
    this._walls.push(wall);
  }

  private _createOuterBorder(roomX: number, roomY: number, roomZ: number) {
    const wall = new WallOuterCorner();

    const { x, y } = this._getPosition(roomX + 1, roomY, roomZ);
    wall.x = x - this._borderWidth;
    wall.y = y + (32 - this._borderWidth);
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
        this._createLeftWall(x, y, z, { hideBorder: element.hideBorder });
        break;

      case "innerCorner":
        this._createRightWall(x, y, z);
        this._createLeftWall(x, y, z, { hideBorder: true });
        break;

      case "outerCorner":
        this._createOuterBorder(x, y, z);
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
