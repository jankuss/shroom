import * as PIXI from "pixi.js";
import { AnimationTicker } from "../../AnimationTicker";
import { FurnitureData } from "../../FurnitureData";
import { HitDetection } from "../../HitDetection";
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

const defaultConfig: IConfiguration = {};

function createSimpleConfig(
  application: PIXI.Application,
  resourcePath?: string,
  configuration: IConfiguration = defaultConfig
): Dependencies {
  const furnitureData = FurnitureData.create(resourcePath);

  return {
    animationTicker: AnimationTicker.create(application),
    avatarLoader: AvatarLoader.create(resourcePath),
    furnitureLoader: FurnitureLoader.create(furnitureData, resourcePath),
    hitDetection: HitDetection.create(application),
    configuration: configuration,
    furnitureData,
  };
}

interface Dependencies {
  animationTicker: IAnimationTicker;
  avatarLoader: IAvatarLoader;
  furnitureLoader: IFurnitureLoader;
  hitDetection: IHitDetection;
  configuration: IConfiguration;
  furnitureData?: IFurnitureData;
}

type TileMap = TileType[][] | string;

let globalDependencies: Dependencies | undefined;

export class Room
  extends PIXI.Container
  implements IRoomGeometry, IRoomObjectContainer {
  private roomObjects: IRoomObject[] = [];

  private wallOffsets = { x: 1, y: 1 };
  public readonly parsedTileMap: ParsedTileType[][];

  private visualization: RoomVisualization;

  public roomWidth: number;
  public roomHeight: number;

  private wallHeight = 135;
  private tileHeight = 8;

  private tileColor: string = "#989865";

  private animationTicker: IAnimationTicker;
  private avatarLoader: IAvatarLoader;
  private furnitureLoader: IFurnitureLoader;
  private hitDetection: IHitDetection;
  private configuration: IConfiguration;

  private walls: Wall[] = [];
  private floor: (Tile | Stair)[] = [];

  private bounds: { minX: number; minY: number; maxX: number; maxY: number };

  private _wallTexture: Promise<PIXI.Texture> | PIXI.Texture | undefined;
  private _floorTexture: Promise<PIXI.Texture> | PIXI.Texture | undefined;

  private _wallColor: string | undefined;
  private _floorColor: string | undefined;

  private _currentWallTexture: PIXI.Texture | undefined;
  private _currentFloorTexture: PIXI.Texture | undefined;

  private _onTileClick: ((position: RoomPosition) => void) | undefined;

  private _getTilePositionWithOffset(roomX: number, roomY: number) {
    return {
      x: roomX + this.wallOffsets.x,
      y: roomY + this.wallOffsets.y,
    };
  }

  getTileAtPosition(roomX: number, roomY: number) {
    const { x, y } = this._getTilePositionWithOffset(roomX, roomY);

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

    const { largestDiff, tilemap: parsedTileMap } = parseTileMap(
      normalizedTileMap
    );

    this.parsedTileMap = parsedTileMap;
    this.wallHeight = this.wallHeight + largestDiff * 32;

    this.visualization = new RoomVisualization();

    this.bounds = getTileMapBounds(parsedTileMap, this.wallOffsets);
    this.initTiles(this.parsedTileMap);

    this.roomWidth = this.bounds.maxX - this.bounds.minX;
    this.roomHeight = this.bounds.maxY - this.bounds.minY;

    this.animationTicker = animationTicker;
    this.furnitureLoader = furnitureLoader;
    this.avatarLoader = avatarLoader;
    this.hitDetection = hitDetection;
    this.configuration = configuration;

    this.addChild(this.visualization);
  }

  static create({
    application,
    resourcePath,
    tilemap,
    configuration,
  }: {
    application: PIXI.Application;
    resourcePath?: string;
    tilemap: TileMap;
    configuration?: IConfiguration;
  }) {
    if (globalDependencies == null) {
      globalDependencies = createSimpleConfig(
        application,
        resourcePath,
        configuration
      );
    }

    return new Room({ ...globalDependencies, tilemap });
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
    this.walls.forEach((wall) => {
      wall.texture = this._currentWallTexture;
      wall.color = this._wallColor;
    });
    this.floor.forEach((floor) => {
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
    });

    this.roomObjects.push(object);
  }

  getPosition(
    roomX: number,
    roomY: number,
    roomZ: number
  ): { x: number; y: number } {
    const { x, y } = this._getTilePositionWithOffset(roomX, roomY);

    const base = 32;

    const xPos = -this.bounds.minX + x * base - y * base;
    const yPos = -this.bounds.minY + x * (base / 2) + y * (base / 2);

    return {
      x: xPos,
      y: yPos - roomZ * 32,
    };
  }

  private registerWall(wall: Wall) {
    this.walls.push(wall);
    this.addRoomObject(wall);
  }

  private registerTile(tile: Stair | Tile) {
    this.floor.push(tile);
    this.addRoomObject(tile);
  }

  private registerTileCursor(position: RoomPosition) {
    this.addRoomObject(
      new TileCursor(position, (position) => {
        this.onTileClick && this.onTileClick(position);
      })
    );
  }

  private initTiles(tiles: ParsedTileType[][]) {
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tile = tiles[y][x];

        if (tile.type === "tile") {
          this.registerTile(
            new Tile({
              geometry: this,
              roomX: x - this.wallOffsets.x,
              roomY: y - this.wallOffsets.y,
              roomZ: tile.z,
              edge: true,
              tileHeight: this.tileHeight,
              color: this.floorColor ?? this.tileColor,
            })
          );

          this.registerTileCursor({
            roomX: x - this.wallOffsets.x,
            roomY: y - this.wallOffsets.y,
            roomZ: tile.z,
          });
        }

        const direction = getWallDirection(tile);

        if (direction != null && tile.type === "wall") {
          this.registerWall(
            new Wall({
              geometry: this,
              roomX: x - this.wallOffsets.x,
              roomY: y - this.wallOffsets.y,
              direction: direction,
              tileHeight: this.tileHeight,
              wallHeight: this.wallHeight,
              roomZ: tile.height,
              color: this.wallColor ?? "#ffffff",
              texture: this._currentWallTexture,
            })
          );
        }

        if (tile.type === "wall" && tile.kind === "innerCorner") {
          this.registerWall(
            new Wall({
              geometry: this,
              roomX: x - this.wallOffsets.x,
              roomY: y - this.wallOffsets.y,
              direction: "right",
              tileHeight: this.tileHeight,
              wallHeight: this.wallHeight,
              side: false,
              roomZ: tile.height,
              color: "#ffffff",
            })
          );

          this.registerWall(
            new Wall({
              geometry: this,
              roomX: x - this.wallOffsets.x,
              roomY: y - this.wallOffsets.y,
              direction: "left",
              tileHeight: this.tileHeight,
              wallHeight: this.wallHeight,
              side: false,
              roomZ: tile.height,
              color: "#ffffff",
            })
          );
        }

        if (tile.type === "stairs") {
          this.registerTile(
            new Stair({
              geometry: this,
              roomX: x - this.wallOffsets.x,
              roomY: y - this.wallOffsets.y,
              roomZ: tile.z,
              tileHeight: this.tileHeight,
              color: this.tileColor,
              direction: tile.kind,
            })
          );

          this.registerTileCursor({
            roomX: x - this.wallOffsets.x,
            roomY: y - this.wallOffsets.y,
            roomZ: tile.z,
          });

          this.registerTileCursor({
            roomX: x - this.wallOffsets.x,
            roomY: y - this.wallOffsets.y,
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
