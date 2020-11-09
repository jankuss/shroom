import * as PIXI from "pixi.js";
import { AnimationTicker } from "../../AnimationTicker";
import { IAnimationTicker } from "../../IAnimationTicker";
import { IAvatarLoader } from "../../IAvatarLoader";
import { IFurnitureLoader } from "../../IFurnitureLoader";
import { IRoomGeometry } from "../../IRoomGeometry";
import { IRoomObject } from "../../IRoomObject";
import { IRoomObjectContainer } from "../../IRoomObjectContainer";
import { ITexturable } from "../../ITextureable";
import { TileType } from "../../types/TileType";
import { ParsedTileType, parseTileMap } from "../../util/parseTileMap";
import { parseTileMapString } from "../../util/parseTileMapString";
import { AvatarLoader } from "../avatar/AvatarLoader";
import { FurnitureLoader } from "../furniture/FurnitureLoader";
import { RoomVisualization } from "./RoomVisualization";
import { Stair } from "./Stair";
import { Tile } from "./Tile";
import { getTileMapBounds } from "./util/getTileMapBounds";
import { Wall } from "./Wall";

function createSimpleConfig(
  application: PIXI.Application,
  resourcePath?: string
): Dependencies {
  return {
    animationTicker: AnimationTicker.create(application),
    avatarLoader: AvatarLoader.create(resourcePath),
    furnitureLoader: FurnitureLoader.create(resourcePath),
  };
}

interface Dependencies {
  animationTicker: IAnimationTicker;
  avatarLoader: IAvatarLoader;
  furnitureLoader: IFurnitureLoader;
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

  private walls: Wall[] = [];
  private floor: ITexturable[] = [];

  private bounds: { minX: number; minY: number; maxX: number; maxY: number };

  private _wallTexture: Promise<PIXI.Texture> | PIXI.Texture | undefined;
  private _floorTexture: Promise<PIXI.Texture> | PIXI.Texture | undefined;

  private _currentWallTexture: PIXI.Texture | undefined;
  private _currentFloorTexture: PIXI.Texture | undefined;

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

  constructor({
    animationTicker,
    avatarLoader,
    furnitureLoader,
    tilemap,
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

    this.addChild(this.visualization);
  }

  static create({
    application,
    resourcePath,
    tilemap,
  }: {
    application: PIXI.Application;
    resourcePath?: string;
    tilemap: TileMap;
  }) {
    if (globalDependencies == null) {
      globalDependencies = createSimpleConfig(application, resourcePath);
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
    });
    this.floor.forEach((floor) => {
      floor.texture = this._currentFloorTexture;
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
    });

    this.roomObjects.push(object);
  }

  getPosition(
    roomX: number,
    roomY: number,
    roomZ: number
  ): { x: number; y: number } {
    roomX = roomX + this.wallOffsets.x;
    roomY = roomY + this.wallOffsets.y;

    const base = 32;

    const xPos = -this.bounds.minX + roomX * base - roomY * base;
    const yPos = -this.bounds.minY + roomX * (base / 2) + roomY * (base / 2);

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
              color: this.tileColor,
            })
          );
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
              color: "#ffffff",
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
