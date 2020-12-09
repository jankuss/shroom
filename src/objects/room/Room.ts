import * as PIXI from "pixi.js";
import { AnimationTicker } from "../AnimationTicker";
import { FurnitureData } from "../FurnitureData";
import { HitDetection } from "../hitdetection/HitDetection";
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
import { AvatarLoader } from "../avatar/AvatarLoader";
import { FurnitureLoader } from "../furniture/FurnitureLoader";
import { RoomVisualization } from "./RoomVisualization";
import { Stair } from "./Stair";
import { Tile } from "./Tile";
import { TileCursor } from "./TileCursor";
import { getTileMapBounds } from "./util/getTileMapBounds";
import { Wall } from "./Wall";
import { Shroom } from "../Shroom";
import { ITileMap } from "../../interfaces/ITileMap";

export interface Dependencies {
  animationTicker: IAnimationTicker;
  avatarLoader: IAvatarLoader;
  furnitureLoader: IFurnitureLoader;
  hitDetection: IHitDetection;
  configuration: IConfiguration;
  furnitureData?: IFurnitureData;
}

type TileMap = TileType[][] | string;

export class Room
  extends PIXI.Container
  implements IRoomGeometry, IRoomObjectContainer, ITileMap {
  private roomObjects: IRoomObject[] = [];

  private _wallOffsets = { x: 1, y: 1 };
  private _positionOffsets = { x: 1, y: 1 };

  public readonly parsedTileMap: ParsedTileType[][];

  private visualization: RoomVisualization;

  public roomWidth: number;
  public roomHeight: number;

  private tileColor: string = "#989865";

  private animationTicker: IAnimationTicker;
  private avatarLoader: IAvatarLoader;
  private furnitureLoader: IFurnitureLoader;
  private hitDetection: IHitDetection;
  private configuration: IConfiguration;

  private _walls: Wall[] = [];
  private _floor: (Tile | Stair)[] = [];
  private _cursors: TileCursor[] = [];
  private _doorWall: Wall | undefined;

  private _roomBounds: {
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
  private _wallHeight: number = 115;
  private _tileHeight: number = 8;

  private _largestDiff: number;

  public get hideWalls() {
    return this._hideWalls;
  }

  public set hideWalls(value) {
    this._hideWalls = value;
    this.updateTiles();
  }

  public get hideFloor() {
    return this._hideFloor;
  }

  public set hideFloor(value) {
    this._hideFloor = value;
    this.updateTiles();
  }

  public get wallHeight() {
    return this._wallHeight + this._largestDiff * 32;
  }

  public set wallHeight(value) {
    this._wallHeight = value;
    this._updateWallHeight();
  }

  private get wallHeightWithZ() {
    return this._wallHeight + this._largestDiff * 32;
  }

  public get tileHeight() {
    return this._tileHeight;
  }

  public set tileHeight(value) {
    this._tileHeight = value;
    this._updateTileHeight();
  }

  public get wallDepth() {
    return this._wallDepth;
  }

  public set wallDepth(value) {
    this._wallDepth = value;
    this._updateWallDepth();
  }

  private _updateWallDepth() {
    this.visualization.disableCache();
    this._walls.forEach((wall) => {
      wall.wallDepth = this.wallDepth;
    });
    this.visualization.enableCache();
  }

  private _updateWallHeight() {
    this.visualization.disableCache();
    this._walls.forEach((wall) => {
      wall.wallHeight = this.wallHeight;
    });
    this.visualization.enableCache();
  }

  private _updateTileHeight() {
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

  private _getTilePositionWithOffset(roomX: number, roomY: number) {
    return {
      x: roomX + this._wallOffsets.x,
      y: roomY + this._wallOffsets.y,
    };
  }

  getTileAtPosition(roomX: number, roomY: number) {
    const { x, y } = this._getObjectPositionWithOffset(roomX, roomY);

    const row = this.parsedTileMap[y];
    if (row == null) return;
    if (row[x] == null) return;

    return row[x];
  }

  get onTileClick() {
    return this._onTileClick;
  }

  set onTileClick(value) {
    this._onTileClick = value;
  }

  get wallTexture() {
    return this._wallTexture;
  }

  set wallTexture(value) {
    this._wallTexture = value;
    this.loadWallTextures();
  }

  get floorTexture() {
    return this._floorTexture;
  }

  set floorTexture(value) {
    this._floorTexture = value;
    this.loadFloorTextures();
  }

  get wallColor() {
    return this._wallColor;
  }

  set wallColor(value) {
    this._wallColor = value;
    this.updateTextures();
  }

  get floorColor() {
    return this._floorColor;
  }

  set floorColor(value) {
    this._floorColor = value;
    this.updateTextures();
  }

  constructor({
    animationTicker,
    avatarLoader,
    furnitureLoader,
    tilemap,
    hitDetection,
    configuration,
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
    } = parseTileMap(normalizedTileMap);

    this._wallOffsets = wallOffsets;
    this._positionOffsets = positionOffsets;

    this._largestDiff = largestDiff;

    this.parsedTileMap = parsedTileMap;

    this.visualization = new RoomVisualization();

    this._roomBounds = getTileMapBounds(parsedTileMap, this._wallOffsets);

    this.roomWidth = this._roomBounds.maxX - this._roomBounds.minX;
    this.roomHeight = this._roomBounds.maxY - this._roomBounds.minY;

    this.animationTicker = animationTicker;
    this.furnitureLoader = furnitureLoader;
    this.avatarLoader = avatarLoader;
    this.hitDetection = hitDetection;
    this.configuration = configuration;

    this.updateTiles();
    this.addChild(this.visualization);
  }

  static create(shroom: Shroom, { tilemap }: { tilemap: TileMap }) {
    return new Room({ ...shroom.dependencies, tilemap });
  }

  private loadWallTextures() {
    Promise.resolve(this.wallTexture).then((texture) => {
      this._currentWallTexture = texture;
      this.updateTextures();
    });
  }

  private loadFloorTextures() {
    Promise.resolve(this.floorTexture).then((texture) => {
      this._currentFloorTexture = texture;
      this.updateTextures();
    });
  }

  private updateTextures() {
    this.visualization.disableCache();
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

  addRoomObject(object: IRoomObject) {
    object.setParent({
      geometry: this,
      visualization: this.visualization,
      animationTicker: this.animationTicker,
      furnitureLoader: this.furnitureLoader,
      roomObjectContainer: this,
      avatarLoader: this.avatarLoader,
      hitDetection: this.hitDetection,
      configuration: this.configuration,
      tilemap: this,
    });

    this.roomObjects.push(object);
  }

  getPosition(
    roomX: number,
    roomY: number,
    roomZ: number,
    type: "plane" | "object"
  ): { x: number; y: number } {
    const { x, y } =
      type === "plane"
        ? this._getTilePositionWithOffset(roomX, roomY)
        : this._getObjectPositionWithOffset(roomX, roomY);

    const base = 32;

    const xPos = -this._roomBounds.minX + x * base - y * base;
    const yPos = -this._roomBounds.minY + x * (base / 2) + y * (base / 2);

    return {
      x: xPos,
      y: yPos - roomZ * 32,
    };
  }

  private registerWall(wall: Wall) {
    if (this.hideWalls || this.hideFloor) return;

    this._walls.push(wall);
    this.addRoomObject(wall);
  }

  private registerTile(tile: Stair | Tile) {
    if (this.hideFloor) return;

    this._floor.push(tile);
    this.addRoomObject(tile);
  }

  private registerTileCursor(position: RoomPosition, door: boolean = false) {
    const cursor = new TileCursor(position, door, (position) => {
      this.onTileClick && this.onTileClick(position);
    });

    this._cursors.push(cursor);

    this.addRoomObject(cursor);
  }

  private resetTiles() {
    [...this._floor, ...this._walls, ...this._cursors].forEach((value) =>
      value.destroy()
    );

    this._floor = [];
    this._walls = [];
    this._cursors = [];
    this._doorWall = undefined;
  }

  private updateTiles() {
    this.resetTiles();

    const tiles = this.parsedTileMap;

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tile = tiles[y][x];

        if (tile.type === "door") {
          this.registerTile(
            new Tile({
              geometry: this,
              roomX: x - this._wallOffsets.x,
              roomY: y - this._wallOffsets.y,
              roomZ: tile.z,
              edge: true,
              tileHeight: this.tileHeight,
              color: this.floorColor ?? this.tileColor,
              door: true,
            })
          );

          const wall = new Wall({
            geometry: this,
            roomX: x - this._wallOffsets.x,
            roomY: y - this._wallOffsets.y,
            direction: "left",
            tileHeight: this.tileHeight,
            wallHeight: this.wallHeightWithZ,
            roomZ: tile.z,
            color: this.wallColor ?? "#ffffff",
            texture: this._currentWallTexture,
            wallDepth: this.wallDepth,
            hideBorder: true,
            doorHeight: 30,
          });

          this.registerWall(wall);

          this._doorWall = wall;

          this.registerTileCursor(
            {
              roomX: x - this._wallOffsets.x,
              roomY: y - this._wallOffsets.y,
              roomZ: tile.z,
            },
            true
          );
        }

        if (tile.type === "tile") {
          this.registerTile(
            new Tile({
              geometry: this,
              roomX: x - this._wallOffsets.x,
              roomY: y - this._wallOffsets.y,
              roomZ: tile.z,
              edge: true,
              tileHeight: this.tileHeight,
              color: this.floorColor ?? this.tileColor,
            })
          );

          this.registerTileCursor({
            roomX: x - this._wallOffsets.x,
            roomY: y - this._wallOffsets.y,
            roomZ: tile.z,
          });
        }

        const direction = getWallDirection(tile);

        if (direction != null && tile.type === "wall") {
          this.registerWall(
            new Wall({
              geometry: this,
              roomX: x - this._wallOffsets.x,
              roomY: y - this._wallOffsets.y,
              direction: direction,
              tileHeight: this.tileHeight,
              wallHeight: this.wallHeightWithZ,
              roomZ: tile.height,
              color: this.wallColor ?? "#ffffff",
              texture: this._currentWallTexture,
              wallDepth: this.wallDepth,
              hideBorder: tile.hideBorder,
            })
          );
        }

        if (tile.type === "wall" && tile.kind === "innerCorner") {
          this.registerWall(
            new Wall({
              geometry: this,
              roomX: x - this._wallOffsets.x,
              roomY: y - this._wallOffsets.y,
              direction: "right",
              tileHeight: this.tileHeight,
              wallHeight: this.wallHeightWithZ,
              side: false,
              roomZ: tile.height,
              color: "#ffffff",
              wallDepth: this.wallDepth,
            })
          );

          this.registerWall(
            new Wall({
              geometry: this,
              roomX: x - this._wallOffsets.x,
              roomY: y - this._wallOffsets.y,
              direction: "left",
              tileHeight: this.tileHeight,
              wallHeight: this.wallHeightWithZ,
              side: false,
              roomZ: tile.height,
              color: "#ffffff",
              wallDepth: this.wallDepth,
            })
          );
        }

        if (tile.type === "stairs") {
          this.registerTile(
            new Stair({
              geometry: this,
              roomX: x - this._wallOffsets.x,
              roomY: y - this._wallOffsets.y,
              roomZ: tile.z,
              tileHeight: this.tileHeight,
              color: this.tileColor,
              direction: tile.kind,
            })
          );

          this.registerTileCursor({
            roomX: x - this._wallOffsets.x,
            roomY: y - this._wallOffsets.y,
            roomZ: tile.z,
          });

          this.registerTileCursor({
            roomX: x - this._wallOffsets.x,
            roomY: y - this._wallOffsets.y,
            roomZ: tile.z + 1,
          });
        }
      }
    }
  }
}

const getWallDirection = (tile: ParsedTileType) => {
  if (tile.type !== "wall") return;

  if (tile.kind === "rowWall") return "left" as const;
  if (tile.kind === "colWall") return "right" as const;
  if (tile.kind === "outerCorner") return "corner" as const;
};
