import * as PIXI from "pixi.js";
import { TileType } from "./types/TileType";
import { ParsedTileType, parseTileMap } from "./util/parseTileMap";
import { Tile } from "./Tile";
import { IRoomGeometry } from "./IRoomGeometry";
import { Furniture } from "./Furniture";
import { Wall } from "./Wall";
import { Stair } from "./Stair";
import { IRoomObject } from "./IRoomObject";
import { IAnimationTicker } from "./IAnimationTicker";
import { IFurnitureLoader } from "./IFurnitureLoader";

export class Room extends PIXI.Container implements IRoomGeometry {
  private roomObjects: IRoomObject[] = [];

  private offsetX: number;
  private offsetY: number;
  private wallOffsets = { x: 1, y: 1 };
  private parsedTileMap: ParsedTileType[][];

  private container: PIXI.Container = new PIXI.Container();
  private plane: PIXI.Container = new PIXI.Container();

  public roomWidth: number;
  public roomHeight: number;

  private wallHeight = 135;
  private tileHeight = 8;

  private tileColor: string = "#989865";

  constructor(
    tilemap: TileType[][],
    private animationTicker: IAnimationTicker,
    private furniLoader: IFurnitureLoader
  ) {
    super();
    const { largestDiff, tilemap: parsedTileMap } = parseTileMap(tilemap);

    this.parsedTileMap = parsedTileMap;
    this.wallHeight = this.wallHeight + largestDiff * 32;

    const { rows, columns } = this.getTileDimensions();

    const leftWidth = (rows - this.wallOffsets.y) * 32;

    this.offsetX = leftWidth;
    this.offsetY = -32 * this.wallOffsets.y;

    this.initTiles(this.parsedTileMap);

    const width = rows * 32 + columns * 32;
    const height = columns * 16 + rows * 16;

    this.roomWidth = width;
    this.roomHeight = height;

    this.container.sortableChildren = true;

    this.addChild(this.plane);
    this.addChild(this.container);
  }

  getTileDimensions() {
    const rows = this.parsedTileMap.length - this.wallOffsets.y;
    const columns = this.parsedTileMap[0].length - this.wallOffsets.x;

    return {
      rows,
      columns,
    };
  }

  calculateBounds() {
    const { rows, columns } = this.getTileDimensions();
  }

  addRoomObject(object: IRoomObject) {
    object.setParent({
      container: this.container,
      geometry: this,
      addRoomObject: (object) => this.addRoomObject(object),
      plane: this.plane,
      animationTicker: this.animationTicker,
      furnitureLoader: this.furniLoader,
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

    const xPos = this.offsetX + roomX * base - roomY * base;
    const yPos = this.offsetY + roomX * (base / 2) + roomY * (base / 2);

    return {
      x: xPos,
      y: yPos - roomZ * 32,
    };
  }

  private initTiles(tiles: ParsedTileType[][]) {
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tile = tiles[y][x];

        if (tile.type === "tile") {
          this.addRoomObject(
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
          this.addRoomObject(
            new Wall({
              geometry: this,
              roomX: x - this.wallOffsets.x,
              roomY: y - this.wallOffsets.y,
              direction: direction,
              tileHeight: this.tileHeight,
              wallHeight: this.wallHeight,
              roomZ: tile.height,
              color: "#ffffff",
            })
          );
        }

        if (
          tile.type === "wall" &&
          (tile.kind === "rowWall" ||
            tile.kind === "colWall" ||
            tile.kind === "outerCorner")
        ) {
        }

        if (tile.type === "wall" && tile.kind === "innerCorner") {
          this.addRoomObject(
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

          this.addRoomObject(
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
          this.addRoomObject(
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

    this.plane.cacheAsBitmap = true;
  }
}

const getWallDirection = (tile: ParsedTileType) => {
  if (tile.type !== "wall") return;

  if (tile.kind === "rowWall") return "left" as const;
  if (tile.kind === "colWall") return "right" as const;
  if (tile.kind === "outerCorner") return "corner" as const;
};
