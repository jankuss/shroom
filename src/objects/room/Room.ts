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
import { ParsedTileType } from "../../util/parseTileMap";
import { parseTileMapString } from "../../util/parseTileMapString";
import { Shroom } from "../Shroom";
import { ITileMap } from "../../interfaces/ITileMap";
import { RoomObjectContainer } from "./RoomObjectContainer";
import { Subject } from "rxjs";
import { RoomModelVisualization } from "./RoomModelVisualization";
import { ParsedTileMap } from "./ParsedTileMap";
import { getTileColors, getWallColors } from "./util/getTileColors";

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
  public readonly application: PIXI.Application;

  private _roomObjectContainer: RoomObjectContainer;
  private _visualization: RoomModelVisualization;

  private _animationTicker: IAnimationTicker;
  private _avatarLoader: IAvatarLoader;
  private _furnitureLoader: IFurnitureLoader;
  private _hitDetection: IHitDetection;
  private _configuration: IConfiguration;

  private _wallTexture: Promise<PIXI.Texture> | PIXI.Texture | undefined;
  private _floorTexture: Promise<PIXI.Texture> | PIXI.Texture | undefined;

  private _wallColor: string | undefined;
  private _floorColor: string | undefined;

  private _currentWallTexture: PIXI.Texture | undefined;

  private _onTileClick: ((position: RoomPosition) => void) | undefined;

  private _application: PIXI.Application;

  public get onActiveTileChange() {
    return this._visualization.onActiveTileChange;
  }

  public get onActiveWallChange() {
    return this._visualization.onActiveWallChange;
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

    this._application = application;

    this._animationTicker = animationTicker;
    this._furnitureLoader = furnitureLoader;
    this._avatarLoader = avatarLoader;
    this._hitDetection = hitDetection;
    this._configuration = configuration;
    this.application = application;

    this._visualization = new RoomModelVisualization(
      this._hitDetection,
      this.application,
      new ParsedTileMap(normalizedTileMap)
    );

    this._roomObjectContainer = new RoomObjectContainer();
    this._roomObjectContainer.context = {
      geometry: this,
      visualization: this._visualization,
      animationTicker: this._animationTicker,
      furnitureLoader: this._furnitureLoader,
      roomObjectContainer: this,
      avatarLoader: this._avatarLoader,
      hitDetection: this._hitDetection,
      configuration: this._configuration,
      tilemap: this,
      landscapeContainer: this._visualization,
      application: this._application,
      room: this,
    };

    this.addChild(this._visualization);

    this._visualization.onTileClick.subscribe((value) => {
      this.onTileClick && this.onTileClick(value);
    });
  }

  /**
   * Creates a new room.
   * @param shroom A shroom instance
   * @param options Room creation options
   */
  static create(shroom: Shroom, { tilemap }: CreateOptions) {
    return new Room({ ...shroom.dependencies, tilemap });
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
    return this._visualization.hideWalls;
  }

  public set hideWalls(value) {
    this._visualization.hideWalls = value;
  }

  /**
   * When set to true, hide the floor. This will also hide the walls.
   */
  public get hideFloor() {
    return this._visualization.hideFloor;
  }

  public set hideFloor(value) {
    this._visualization.hideFloor = value;
  }

  public get hideTileCursor() {
    return this._visualization.hideTileCursor;
  }

  public set hideTileCursor(value) {
    this._visualization.hideTileCursor = value;
  }

  /**
   * Height of the walls in the room.
   */
  public get wallHeight() {
    return this._visualization.wallHeight;
  }

  public set wallHeight(value) {
    this._visualization.wallHeight = value;
  }

  /**
   * Height of the tile
   */
  public get tileHeight() {
    return this._visualization.tileHeight;
  }

  public set tileHeight(value) {
    this._visualization.tileHeight = value;
  }

  /**
   * Depth of the wall
   */
  public get wallDepth() {
    return this._visualization.wallDepth;
  }

  public set wallDepth(value) {
    this._visualization.wallDepth = value;
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
    this._updateWallColor();
  }

  /**
   * Color of the floor.
   */
  get floorColor() {
    return this._floorColor;
  }

  set floorColor(value) {
    this._floorColor = value;
    this._updateTileColor();
  }

  /**
   * Height of the room.
   */
  public get roomHeight() {
    return this._visualization.rectangle.height;
  }

  /**
   * Width of the room.
   */
  public get roomWidth() {
    return this._visualization.rectangle.width;
  }

  getParsedTileTypes(): ParsedTileType[][] {
    return this._visualization.parsedTileMap.parsedTileTypes;
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
    return this._visualization.getScreenPosition(roomX, roomY, roomZ);
  }

  getTileAtPosition(roomX: number, roomY: number) {
    const { x, y } = this._getObjectPositionWithOffset(roomX, roomY);

    const row = this._visualization.parsedTileMap.parsedTileTypes[y];
    if (row == null) return;
    if (row[x] == null) return;

    return row[x];
  }

  destroy() {
    super.destroy();
    this.roomObjects.forEach((object) => this.removeRoomObject(object));
  }

  private _getObjectPositionWithOffset(roomX: number, roomY: number) {
    return {
      x: roomX,
      y: roomY,
    };
  }

  private _loadWallTextures() {
    Promise.resolve(this.wallTexture).then((texture) => {
      this._currentWallTexture = texture;
      this._visualization.wallTexture = texture;
    });
  }

  private _loadFloorTextures() {
    Promise.resolve(this.floorTexture).then((texture) => {
      this._visualization.floorTexture = texture;
    });
  }

  private _updateWallColor() {
    const wallColors = getWallColors(this._getWallColor());

    this._visualization.wallLeftColor = wallColors.rightTint;
    this._visualization.wallRightColor = wallColors.leftTint;
    this._visualization.wallTopColor = wallColors.topTint;
  }

  private _updateTileColor() {
    if (this._floorColor != null) {
      const tileColors = getTileColors(this._floorColor);

      this._visualization.tileTopColor = tileColors.tileTint;
      this._visualization.tileLeftColor = tileColors.borderRightTint;
      this._visualization.tileRightColor = tileColors.borderLeftTint;
    } else {
      this._visualization.tileTopColor = undefined;
      this._visualization.tileLeftColor = undefined;
      this._visualization.tileRightColor = undefined;
    }
  }

  private _getWallColor() {
    if (this.wallColor == null && this._currentWallTexture != null) {
      return "#ffffff";
    }

    if (this.wallColor == null && this._currentWallTexture == null) {
      return "#b6b8c7";
    }

    return this.wallColor ?? "#ffffff";
  }
}
