import * as PIXI from "pixi.js";
import { IAnimationTicker } from "../../interfaces/IAnimationTicker";
import { IAvatarLoader } from "../../interfaces/IAvatarLoader";
import { IConfiguration } from "../../interfaces/IConfiguration";
import { IFurnitureData } from "../../interfaces/IFurnitureData";
import { IFurnitureLoader } from "../../interfaces/IFurnitureLoader";
import { IHitDetection } from "../../interfaces/IHitDetection";
import { IRoomGeometry } from "../../interfaces/IRoomGeometry";
import { IRoomObject } from "../../interfaces/IRoomObject";
import { IRoomObjectContainer } from "../../interfaces/IRoomObjectContainer";
import { RoomPosition } from "../../types/RoomPosition";
import { TileType } from "../../types/TileType";
import { ParsedTileType, parseTileMap } from "../../util/parseTileMap";
import { parseTileMapString } from "../../util/parseTileMapString";
import { RoomVisualization } from "./RoomVisualization";
import { Stair } from "./Stair";
import { Tile } from "./Tile";
import { TileCursor } from "./TileCursor";
import { getTileMapBounds } from "./util/getTileMapBounds";
import { Wall } from "./Wall";
import { Shroom } from "../Shroom";
import { ITileMap } from "../../interfaces/ITileMap";
import { ILandscapeContainer } from "./ILandscapeContainer";
import { RoomObjectContainer } from "./RoomObjectContainer";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { StairCorner } from "./StairCorner";

export interface Dependencies {
  animationTicker: IAnimationTicker;
  avatarLoader: IAvatarLoader;
  furnitureLoader: IFurnitureLoader;
  hitDetection: IHitDetection;
  configuration: IConfiguration;
  furnitureData?: IFurnitureData;
  application: PIXI.Application;
}

type TileMap = TileType[][] | string;

interface CreateOptions {
  /**
   * A tilemap string or 2d-array. This should have the following format
   * ```
   * xxxx  <- Upper padding
   * x000  <- Tiles
   * x000
   * x000
   *
   * |
   * |
   * Side padding
   * ```
   */
  tilemap: TileMap;
}

export class Room
  extends PIXI.Container
  implements IRoomGeometry, IRoomObjectContainer, ITileMap {
  private _roomObjectContainer: RoomObjectContainer;

  private _wallOffsets = { x: 1, y: 1 };
  private _positionOffsets = { x: 1, y: 1 };

  public readonly parsedTileMap: ParsedTileType[][];

  private visualization: RoomVisualization;

  private tileColor: string = "#989865";

  private animationTicker: IAnimationTicker;
  private avatarLoader: IAvatarLoader;
  private furnitureLoader: IFurnitureLoader;
  private hitDetection: IHitDetection;
  private configuration: IConfiguration;
  public readonly application: PIXI.Application;

  private _walls: Wall[] = [];
  private _floor: (Tile | Stair | StairCorner)[] = [];
  private _cursors: TileCursor[] = [];
  private _doorWall: Wall | undefined;

  private _tileMapBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };

  private _wallTexture: Promise<PIXI.Texture> | PIXI.Texture | undefined;
  private _floorTexture: Promise<PIXI.Texture> | PIXI.Texture | undefined;

  private _wallColor: string | undefined;
  private _floorColor: string | undefined;

  private _currentWallTexture: PIXI.Texture | undefined;
  private _currentFloorTexture: PIXI.Texture | undefined;

  private _hideWalls = false;
  private _hideFloor = false;

  private _onTileClick: ((position: RoomPosition) => void) | undefined;

  private _wallDepth: number = 8;
  private _wallHeight: number = 116;
  private _tileHeight: number = 8;
  private _application: PIXI.Application;
  private _maskOffsets: { x: number; y: number } = { x: 0, y: 0 };

  private _largestDiff: number;

  private _activeTileSubject = new Subject<RoomPosition | undefined>();

  private _landscapeContainer: ILandscapeContainer = {
    getMaskLevel: (roomX, roomY) => {
      return {
        roomX: roomX - this._maskOffsets.x,
        roomY: roomY - this._maskOffsets.y,
      };
    },
  };

  public get onActiveTileChange() {
    return this._activeTileSubject.asObservable();
  }

  constructor({
    animationTicker,
    avatarLoader,
    furnitureLoader,
    tilemap,
    hitDetection,
    configuration,
    application,
  }: {
    tilemap: TileMap;
  } & Dependencies) {
    super();
    const normalizedTileMap =
      typeof tilemap === "string" ? parseTileMapString(tilemap) : tilemap;

    const {
      largestDiff,
      tilemap: parsedTileMap,
      wallOffsets,
      positionOffsets,
      maskOffsets,
    } = parseTileMap(normalizedTileMap);

    this._wallOffsets = wallOffsets;
    this._positionOffsets = positionOffsets;
    this._maskOffsets = maskOffsets;

    this._largestDiff = largestDiff;

    this.parsedTileMap = parsedTileMap;

    this._application = application;

    this._tileMapBounds = getTileMapBounds(parsedTileMap, this._wallOffsets);

    this.animationTicker = animationTicker;
    this.furnitureLoader = furnitureLoader;
    this.avatarLoader = avatarLoader;
    this.hitDetection = hitDetection;
    this.configuration = configuration;
    this.application = application;

    this.visualization = new RoomVisualization(
      this,
      this._application.renderer
    );

    this._updatePosition();
    this._roomObjectContainer = new RoomObjectContainer();
    this._roomObjectContainer.context = {
      geometry: this,
      visualization: this.visualization,
      animationTicker: this.animationTicker,
      furnitureLoader: this.furnitureLoader,
      roomObjectContainer: this,
      avatarLoader: this.avatarLoader,
      hitDetection: this.hitDetection,
      configuration: this.configuration,
      tilemap: this,
      landscapeContainer: this._landscapeContainer,
      application: this._application,
      room: this,
    };

    this._updateTiles();
    this.addChild(this.visualization);
  }

  /**
   * Creates a new room.
   * @param shroom A shroom instance
   * @param options Room creation options
   */
  static create(shroom: Shroom, { tilemap }: CreateOptions) {
    return new Room({ ...shroom.dependencies, tilemap });
  }

  private _updatePosition() {
    this.visualization.x =
      Math.round(-this.roomBounds.minX / 2) * 2 + this._tileMapBounds.minX;
    this.visualization.y = Math.round(-this.roomBounds.minY / 2) * 2;
  }

  /**
   * Bounds of the room
   */
  public get roomBounds() {
    return {
      ...this._tileMapBounds,
      minX: this._tileMapBounds.minX - this.wallDepth,
      maxX: this._tileMapBounds.maxX + this.wallDepth,
      minY: this._tileMapBounds.minY - this.wallHeight - this.wallDepth,
      maxY: this._tileMapBounds.maxY + this.tileHeight,
    };
  }

  /**
   * Room objects which are attached to the room.
   */
  public get roomObjects() {
    return this._roomObjectContainer.roomObjects;
  }

  /**
   * When set to true, hides the walls
   */
  public get hideWalls() {
    return this._hideWalls;
  }

  public set hideWalls(value) {
    this._hideWalls = value;
    this._updateTiles();
  }

  /**
   * When set to true, hide the floor. This will also hide the walls.
   */
  public get hideFloor() {
    return this._hideFloor;
  }

  public set hideFloor(value) {
    this._hideFloor = value;
    this._updateTiles();
  }

  /**
   * Height of the walls in the room.
   */
  public get wallHeight() {
    return this._wallHeight;
  }

  public set wallHeight(value) {
    this._wallHeight = value;
    this._updateWallHeight();
  }

  public get wallHeightWithZ() {
    return this.wallHeight + this._largestDiff * 32;
  }

  /**
   * Height of the tile
   */
  public get tileHeight() {
    return this._tileHeight;
  }

  public set tileHeight(value) {
    this._tileHeight = value;
    this._updateTileHeight();
  }

  /**
   * Depth of the wall
   */
  public get wallDepth() {
    return this._wallDepth;
  }

  public set wallDepth(value) {
    this._wallDepth = value;
    this._updateWallDepth();
  }

  /**
   * A callback which is called with the tile position when a tile is clicked.
   */
  get onTileClick() {
    return this._onTileClick;
  }

  set onTileClick(value) {
    this._onTileClick = value;
  }

  /**
   * Texture of the wall.
   */
  get wallTexture() {
    return this._wallTexture;
  }

  set wallTexture(value) {
    this._wallTexture = value;
    this._loadWallTextures();
  }

  /**
   * Texture of the floor.
   */
  get floorTexture() {
    return this._floorTexture;
  }

  set floorTexture(value) {
    this._floorTexture = value;
    this._loadFloorTextures();
  }

  /**
   * Color of the wall.
   */
  get wallColor() {
    return this._wallColor;
  }

  set wallColor(value) {
    this._wallColor = value;
    this._updateTextures();
  }

  /**
   * Color of the floor.
   */
  get floorColor() {
    return this._floorColor;
  }

  set floorColor(value) {
    this._floorColor = value;
    this._updateTextures();
  }

  /**
   * Height of the room.
   */
  public get roomHeight() {
    return this.roomBounds.maxY - this.roomBounds.minY;
  }

  /**
   * Width of the room.
   */
  public get roomWidth() {
    return this.roomBounds.maxX - this.roomBounds.minX;
  }

  getParsedTileTypes(): ParsedTileType[][] {
    return this.parsedTileMap;
  }

  private _updateWallDepth() {
    this._updatePosition();
    this.visualization.disableCache();
    this._walls.forEach((wall) => {
      wall.wallDepth = this.wallDepth;
    });
    this.visualization.enableCache();
  }

  private _updateWallHeight() {
    this._updatePosition();
    this.visualization.updateRoom(this);
    this.visualization.disableCache();
    this._walls.forEach((wall) => {
      wall.wallHeight = this.wallHeightWithZ;
    });
    this.visualization.enableCache();
  }

  private _updateTileHeight() {
    this._updatePosition();
    this.visualization.disableCache();
    this._floor.forEach((floor) => {
      floor.tileHeight = this.tileHeight;
    });
    this._walls.forEach((wall) => {
      wall.tileHeight = this.tileHeight;
    });
    this.visualization.enableCache();
  }

  private _getObjectPositionWithOffset(roomX: number, roomY: number) {
    return {
      x: roomX + this._positionOffsets.x,
      y: roomY + this._positionOffsets.y,
    };
  }

  getTileAtPosition(roomX: number, roomY: number) {
    const { x, y } = this._getObjectPositionWithOffset(roomX, roomY);

    const row = this.parsedTileMap[y];
    if (row == null) return;
    if (row[x] == null) return;

    return row[x];
  }

  private _loadWallTextures() {
    Promise.resolve(this.wallTexture).then((texture) => {
      this._currentWallTexture = texture;
      this._updateTextures();
    });
  }

  private _loadFloorTextures() {
    Promise.resolve(this.floorTexture).then((texture) => {
      this._currentFloorTexture = texture;
      this._updateTextures();
    });
  }

  private _updateTextures() {
    this.visualization.disableCache();
    this._updateTiles();
    this._walls.forEach((wall) => {
      wall.texture = this._currentWallTexture;
      wall.color = this._wallColor;
    });
    this._floor.forEach((floor) => {
      floor.texture = this._currentFloorTexture;
      floor.color = this._floorColor;
    });
    this.visualization.enableCache();
  }

  /**
   * Adds and registers a room object to a room.
   * @param object The room object to attach
   */
  addRoomObject(object: IRoomObject) {
    this._roomObjectContainer.addRoomObject(object);
  }

  /**
   * Removes and destroys a room object from the room.
   * @param object The room object to remove
   */
  removeRoomObject(object: IRoomObject) {
    this._roomObjectContainer.removeRoomObject(object);
  }

  getPosition(
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
    const xPos = -this._tileMapBounds.minX + x * base - y * base;
    const yPos = x * (base / 2) + y * (base / 2);

    return {
      x: xPos,
      y: yPos - roomZ * 32,
    };
  }

  private _registerWall(wall: Wall) {
    if (this.hideWalls || this.hideFloor) return;

    this._walls.push(wall);
    this.addRoomObject(wall);
  }

  private _registerTile(tile: Stair | StairCorner | Tile) {
    if (this.hideFloor) return;

    this._floor.push(tile);
    this.addRoomObject(tile);
  }

  private _registerTileCursor(position: RoomPosition, door: boolean = false) {
    const cursor = new TileCursor(
      position,
      door,
      (position) => {
        this.onTileClick && this.onTileClick(position);
      },
      (position) => {
        this._activeTileSubject.next(position);
      },
      (position) => {
        this._activeTileSubject.next(undefined);
      }
    );

    this._cursors.push(cursor);

    this.addRoomObject(cursor);
  }

  private _resetTiles() {
    [...this._floor, ...this._walls, ...this._cursors].forEach((value) =>
      value.destroy()
    );

    this._floor = [];
    this._walls = [];
    this._cursors = [];
    this._doorWall = undefined;
  }

  private _getWallColor() {
    if (this.wallColor == null && this._currentWallTexture != null) {
      return "#ffffff";
    }

    if (this.wallColor == null && this._currentWallTexture == null) {
      return "#b6b8c7";
    }

    return "#ffffff";
  }

  private _updateTiles() {
    this._resetTiles();

    const tiles = this.parsedTileMap;

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tile = tiles[y][x];

        if (tile.type === "door") {
          this._registerTile(
            new Tile({
              geometry: this,
              roomX: x,
              roomY: y,
              roomZ: tile.z,
              edge: true,
              tileHeight: this.tileHeight,
              color: this.floorColor ?? this.tileColor,
              door: true,
            })
          );

          const wall = new Wall({
            geometry: this,
            roomX: x,
            roomY: y,
            direction: "left",
            tileHeight: this.tileHeight,
            wallHeight: this.wallHeightWithZ,
            roomZ: tile.z,
            color: this._getWallColor(),
            texture: this._currentWallTexture,
            wallDepth: this.wallDepth,
            hideBorder: true,
            doorHeight: 30,
          });

          this._registerWall(wall);

          this._doorWall = wall;

          this._registerTileCursor(
            {
              roomX: x,
              roomY: y,
              roomZ: tile.z,
            },
            true
          );
        }

        if (tile.type === "tile") {
          this._registerTile(
            new Tile({
              geometry: this,
              roomX: x,
              roomY: y,
              roomZ: tile.z,
              edge: true,
              tileHeight: this.tileHeight,
              color: this.floorColor ?? this.tileColor,
            })
          );

          this._registerTileCursor({
            roomX: x,
            roomY: y,
            roomZ: tile.z,
          });
        }

        const direction = getWallDirection(tile);

        if (direction != null && tile.type === "wall") {
          this._registerWall(
            new Wall({
              geometry: this,
              roomX: x,
              roomY: y,
              direction: direction,
              tileHeight: this.tileHeight,
              wallHeight: this.wallHeightWithZ,
              roomZ: tile.height,
              color: this._getWallColor(),
              texture: this._currentWallTexture,
              wallDepth: this.wallDepth,
              hideBorder: tile.hideBorder,
            })
          );
        }

        if (tile.type === "wall" && tile.kind === "innerCorner") {
          this._registerWall(
            new Wall({
              geometry: this,
              roomX: x,
              roomY: y,
              direction: "right",
              tileHeight: this.tileHeight,
              wallHeight: this.wallHeightWithZ,
              side: false,
              roomZ: tile.height,
              color: this._getWallColor(),
              wallDepth: this.wallDepth,
            })
          );

          this._registerWall(
            new Wall({
              geometry: this,
              roomX: x,
              roomY: y,
              direction: "left",
              tileHeight: this.tileHeight,
              wallHeight: this.wallHeightWithZ,
              side: false,
              roomZ: tile.height,
              color: this._getWallColor(),
              wallDepth: this.wallDepth,
            })
          );
        }

        if (tile.type === "stairs") {
          this._registerTile(
            new Stair({
              geometry: this,
              roomX: x,
              roomY: y,
              roomZ: tile.z,
              tileHeight: this.tileHeight,
              color: this.tileColor,
              direction: tile.kind,
            })
          );

          this._registerTileCursor({
            roomX: x,
            roomY: y,
            roomZ: tile.z,
          });

          this._registerTileCursor({
            roomX: x,
            roomY: y,
            roomZ: tile.z + 1,
          });
        }

        if (tile.type === "stairCorner") {
          this._registerTile(
            new StairCorner({
              geometry: this,
              roomX: x,
              roomY: y,
              roomZ: tile.z,
              tileHeight: this.tileHeight,
              color: this.tileColor,
              type: tile.kind,
            })
          );

          this._registerTileCursor({
            roomX: x,
            roomY: y,
            roomZ: tile.z,
          });

          this._registerTileCursor({
            roomX: x,
            roomY: y,
            roomZ: tile.z + 1,
          });
        }
      }
    }
  }

  destroy() {
    super.destroy();
    this.roomObjects.forEach((object) => this.removeRoomObject(object));
  }
}

const getWallDirection = (tile: ParsedTileType) => {
  if (tile.type !== "wall") return;

  if (tile.kind === "rowWall") return "left" as const;
  if (tile.kind === "colWall") return "right" as const;
  if (tile.kind === "outerCorner") return "corner" as const;
};
