import * as PIXI from "pixi.js";
import { Subject } from "rxjs";
import {
  IRoomVisualization,
  MaskNode,
  PartNode,
  RoomVisualizationMeta,
} from "../../interfaces/IRoomVisualization";
import { RoomPosition } from "../../types/RoomPosition";
import { getZOrder } from "../../util/getZOrder";
import { ParsedTileType, ParsedTileWall } from "../../util/parseTileMap";
import { ILandscapeContainer } from "./ILandscapeContainer";
import { IRoomRectangle, Rectangle } from "./IRoomRectangle";
import { ParsedTileMap } from "./ParsedTileMap";
import { IRoomPart } from "./parts/IRoomPart";
import { RoomPartData } from "./parts/RoomPartData";
import { Stair } from "./parts/Stair";
import { StairCorner } from "./parts/StairCorner";
import { Tile } from "./parts/Tile";
import { TileCursor } from "./parts/TileCursor";
import { WallLeft } from "./parts/WallLeft";
import { WallOuterCorner } from "./parts/WallOuterCorner";
import { WallRight } from "./parts/WallRight";
import { RoomLandscapeMaskSprite } from "./RoomLandscapeMaskSprite";
import { getTileMapBounds } from "./util/getTileMapBounds";

export class RoomModelVisualization
  extends PIXI.Container
  implements IRoomVisualization, IRoomRectangle, ILandscapeContainer {
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
  private _masksLayer: PIXI.Container = new PIXI.Container();

  private _wallTexture: PIXI.Texture | undefined;
  private _floorTexture: PIXI.Texture | undefined;

  private _walls: (WallLeft | WallRight | WallOuterCorner)[] = [];
  private _tiles: (Tile | Stair | StairCorner)[] = [];
  private _tileCursors: TileCursor[] = [];
  private _masks: Map<string, RoomLandscapeMaskSprite> = new Map();

  private _parts: Set<IRoomPart> = new Set();

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

  private _onTileClick = new Subject<RoomPosition>();

  private _tileMapBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };

  private _refreshRoom = false;

  constructor(
    private _application: PIXI.Application,
    public readonly parsedTileMap: ParsedTileMap
  ) {
    super();

    this._tileMapBounds = getTileMapBounds(this.parsedTileMap.parsedTileTypes, {
      x: this.parsedTileMap.wallOffsets.x,
      y: this.parsedTileMap.wallOffsets.y,
    });

    this._positionalContainer.addChild(this._behindWallLayer);
    this._positionalContainer.addChild(this._wallLayer);
    this._positionalContainer.addChild(this._wallHitAreaLayer);
    this._positionalContainer.addChild(this._tileLayer);
    this._positionalContainer.addChild(this._landscapeLayer);
    this._positionalContainer.addChild(this._primaryLayer);

    this._positionalContainer.addChild(this._masksLayer);
    this._positionalContainer.x = -this.roomBounds.minX;
    this._positionalContainer.y = -this.roomBounds.minY;
    this._primaryLayer.sortableChildren = true;
    this._tileLayer.sortableChildren = true;

    this.addChild(this._positionalContainer);

    this._updateHeightmap();

    this._application.ticker.add(this._handleTick);
  }

  addPart(part: IRoomPart): PartNode {
    this._parts.add(part);
    part.update(this._getCurrentRoomPartData());

    return {
      remove: () => {
        this._parts.delete(part);
      },
    };
  }

  getMaskLevel(roomX: number, roomY: number): { roomX: number; roomY: number } {
    return {
      roomX,
      roomY,
    };
  }

  public get wallTexture() {
    return this._wallTexture;
  }

  public set wallTexture(value) {
    this._wallTexture = value;
    this._refreshRoom = true;
  }

  public get floorTexture() {
    return this._floorTexture;
  }

  public set floorTexture(value) {
    this._floorTexture = value;
    this._refreshRoom = true;
  }

  public get wallHeight() {
    return this._wallHeight;
  }

  public set wallHeight(value) {
    this._wallHeight = value;
    this._refreshRoom = true;
  }

  public get tileHeight() {
    return this._tileHeight;
  }

  public set tileHeight(value) {
    this._tileHeight = value;
    this._refreshRoom = true;
  }

  public get wallDepth() {
    return this._borderWidth;
  }

  public set wallDepth(value) {
    this._borderWidth = value;
    this._refreshRoom = true;
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
    return this._wallTopColor;
  }

  public set wallTopColor(value) {
    this._wallTopColor = value;
    this._refreshRoom = true;
  }

  public get tileLeftColor() {
    return this._tileLeftColor;
  }

  public set tileLeftColor(value) {
    this._tileLeftColor = value;
    this._refreshRoom = true;
  }

  public get tileRightColor() {
    return this._tileRightColor;
  }

  public set tileRightColor(value) {
    this._tileRightColor = value;
    this._refreshRoom = true;
  }

  public get tileTopColor() {
    return this._tileTopColor;
  }

  public set tileTopColor(value) {
    this._tileTopColor = value;
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
    const existing = this._masks.get(id);
    const current =
      this._masks.get(id) ??
      new RoomLandscapeMaskSprite({
        renderer: this._application.renderer,
        roomBounds: this.roomBounds,
      });

    current.addSprite(element);
    this._primaryLayer.addChild(current);

    if (existing == null) {
      this._masks.set(id, current);
      this._updateParts();
    }

    return {
      update: () => current.updateSprite(element),
      remove: () => current.removeSprite(element),
      sprite: element,
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
      tileTexture: this._floorTexture ?? PIXI.Texture.WHITE,
      wallTexture: this._wallTexture ?? PIXI.Texture.WHITE,
      masks: this._masks,
    };
  }

  private _setCache(cache: boolean) {
    [this._tileLayer, this._wallLayer].forEach(
      (container) => (container.cacheAsBitmap = cache)
    );
  }

  private _getLargestWallHeight() {
    return this.parsedTileMap.largestDiff * 32 + this._wallHeight;
  }

  private _updateHeightmap() {
    [...this._tileCursors, ...this._tiles, ...this._walls].forEach((part) =>
      part.destroy()
    );

    this._tileCursors = [];
    this._tiles = [];
    this._walls = [];

    for (let y = 0; y < this.parsedTileMap.parsedTileTypes.length; y++) {
      for (let x = 0; x < this.parsedTileMap.parsedTileTypes[y].length; x++) {
        const cell = this.parsedTileMap.parsedTileTypes[y][x];

        this._createHeightmapElement(cell, x, y);
      }
    }

    this._updateParts();
  }

  private _updateParts() {
    this._setCache(false);
    [...this._tiles, ...this._walls, ...this._parts].forEach((tile) =>
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

      case "stairs":
        this._createStair(x, y, element.z, element.kind);
        break;

      case "stairCorner":
        this._createStairCorner(x, y, element.z, element.kind);
        break;
    }
  }

  private _createStairCorner(
    x: number,
    y: number,
    z: number,
    kind: "left" | "front" | "right"
  ) {
    const stair = new StairCorner({ type: kind });
    const position = this._getPosition(x, y, z);

    stair.x = position.x;
    stair.y = position.y;

    this._tiles.push(stair);
    this._tileLayer.addChild(stair);

    this._createTileCursor(x, y, z);
    this._createTileCursor(x, y, z + 1);
  }

  private _createStair(x: number, y: number, z: number, direction: 2 | 0) {
    const stair = new Stair({
      tileHeight: this._tileHeight,
      direction,
    });
    const position = this._getPosition(x, y, z);

    stair.x = position.x;
    stair.y = position.y;

    this._tiles.push(stair);
    this._tileLayer.addChild(stair);

    this._createTileCursor(x, y, z);
    this._createTileCursor(x, y, z + 1);
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
    const tile = new Tile({ color: "#eeeeee", tileHeight: this._tileHeight });

    const xEven = x % 2 === 0;
    const yEven = y % 2 === 0;

    tile.tilePositions = new PIXI.Point(xEven ? 32 : 0, yEven ? 32 : 0);

    const position = this._getPosition(x, y, z);

    tile.x = position.x;
    tile.y = position.y;

    (container ?? this._tileLayer).addChild(tile);
    this._tiles.push(tile);

    this._createTileCursor(x, y, z);
  }

  private _createTileCursor(x: number, y: number, z: number) {
    const position: RoomPosition = { roomX: x, roomY: y, roomZ: z };
    const cursor = new TileCursor(
      position,
      () => {
        this._onTileClick.next(position);
      },
      () => {
        this._onActiveTileChange.next(position);
      },
      () => {
        this._onActiveTileChange.next(undefined);
      }
    );

    const { x: posX, y: posY } = this._getPosition(x, y, z);

    cursor.x = posX;
    cursor.y = posY;
    cursor.zIndex = getZOrder(x, y, z) - 1000;

    this._tileCursors.push(cursor);
    this._primaryLayer.addChild(cursor);
  }

  private _handleTick = () => {
    if (this._refreshRoom) {
      this._updateParts();
      this._refreshRoom = false;
    }
  };

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
    wall.x = x;
    wall.y = y;
    wall.roomZ = roomZ;

    this._wallLayer.addChild(wall);
    this._walls.push(wall);
  }

  private _createOuterBorder(roomX: number, roomY: number, roomZ: number) {
    const wall = new WallOuterCorner();

    const { x, y } = this._getPosition(roomX + 1, roomY, roomZ);
    wall.x = x;
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
