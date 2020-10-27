import * as PIXI from "pixi.js";
import { TileType } from "./types/TileType";
import { ParsedTileType, parseTileMap } from "./util/parseTileMap";
import { Tile } from "./Tile";
import { IRoomGeometry } from "./IRoomGeometry";
import { Furniture } from "./Furniture";
import { Wall } from "./Wall";

export class Room extends PIXI.Container implements IRoomGeometry {
  private furnitures: Furniture[] = [];
  private offsetX: number;
  private offsetY: number;
  private wallOffsets = { x: 1, y: 1 };
  private parsedTileMap: ParsedTileType[][];

  public roomWidth: number;
  public roomHeight: number;

  private wallHeight = 135;
  private titleHeight = 10;

  constructor(tilemap: TileType[][]) {
    super();
    this.sortableChildren = true;

    this.parsedTileMap = parseTileMap(tilemap);

    const { rows, columns } = this.getTileDimensions();

    const leftWidth = (rows - this.wallOffsets.y) * 32;

    this.offsetX = leftWidth;
    this.offsetY = -32 * this.wallOffsets.y;

    this.initTiles(this.parsedTileMap);

    const width = rows * 32 + columns * 32;
    const height = columns * 16 + rows * 16;

    this.roomWidth = width;
    this.roomHeight = height;
  }

  _updateBounds() {
    const { rows, columns } = this.getTileDimensions();

    const width = rows * 32 + columns * 32;
    const height = columns * 16 + rows * 16;

    const bounds = new PIXI.Bounds();

    bounds.minX = this.x;
    bounds.minY = this.y;
    bounds.maxX = this.x + width;
    bounds.maxY = this.y + height;

    console.log(bounds);

    this._bounds = bounds;
  }

  _calculateBounds() {
    this._updateBounds();
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

  addFurniture(furni: Furniture) {
    this.furnitures.push(furni);
    furni.setParent(this);
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

        if (tile.type === "tile" || tile.type === "tile_edge") {
          this.addChild(
            new Tile({
              geometry: this,
              roomX: x - this.wallOffsets.x,
              roomY: y - this.wallOffsets.y,
              roomZ: 0,
              edge: tile.type === "tile_edge",
              tileHeight: this.titleHeight,
            })
          );
        }

        if (
          tile.type === "wall" &&
          (tile.kind === "rowWall" || tile.kind === "colWall")
        ) {
          this.addChild(
            new Wall({
              geometry: this,
              roomX: x - this.wallOffsets.x,
              roomY: y - this.wallOffsets.y,
              direction: tile.kind === "rowWall" ? "left" : "right",
              tileHeight: this.titleHeight,
              wallHeight: this.wallHeight,
            })
          );
        }
      }
    }
  }
}
