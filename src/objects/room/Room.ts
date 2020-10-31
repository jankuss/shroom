import * as PIXI from "pixi.js";
import { IAnimationTicker } from "../../IAnimationTicker";
import { IFurnitureLoader } from "../../IFurnitureLoader";
import { IRoomGeometry } from "../../IRoomGeometry";
import { IRoomObject } from "../../IRoomObject";
import { TileType } from "../../types/TileType";
import { ParsedTileType, parseTileMap } from "../../util/parseTileMap";
import { RoomVisualization } from "./RoomVisualization";
import { Stair } from "./Stair";
import { Tile } from "./Tile";
import { getTileMapBounds } from "./util/getTileMapBounds";
import { Wall } from "./Wall";

export class Room extends PIXI.Container implements IRoomGeometry {
  private roomObjects: IRoomObject[] = [];

  private wallOffsets = { x: 1, y: 1 };
  public readonly parsedTileMap: ParsedTileType[][];

  private visualization: RoomVisualization;

  public roomWidth: number;
  public roomHeight: number;

  private wallHeight = 135;
  private tileHeight = 8;

  private tileColor: string = "#989865";

  private bounds: { minX: number; minY: number; maxX: number; maxY: number };

  constructor(
    tilemap: TileType[][],
    private animationTicker: IAnimationTicker,
    private furniLoader: IFurnitureLoader
  ) {
    super();
    const { largestDiff, tilemap: parsedTileMap } = parseTileMap(tilemap);

    this.parsedTileMap = parsedTileMap;
    this.wallHeight = this.wallHeight + largestDiff * 32;

    this.visualization = new RoomVisualization();

    this.bounds = getTileMapBounds(parsedTileMap, this.wallOffsets);
    this.initTiles(this.parsedTileMap);

    this.roomWidth = this.bounds.maxX - this.bounds.minX;
    this.roomHeight = this.bounds.maxY - this.bounds.minY;

    this.addChild(this.visualization);
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
      geometry: this,
      visualization: this.visualization,
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

    const xPos = -this.bounds.minX + roomX * base - roomY * base;
    const yPos = -this.bounds.minY + roomX * (base / 2) + roomY * (base / 2);

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
  }
}

const getWallDirection = (tile: ParsedTileType) => {
  if (tile.type !== "wall") return;

  if (tile.kind === "rowWall") return "left" as const;
  if (tile.kind === "colWall") return "right" as const;
  if (tile.kind === "outerCorner") return "corner" as const;
};
