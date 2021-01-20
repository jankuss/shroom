import * as PIXI from "pixi.js";
import { PartNode } from "../../interfaces/IRoomVisualization";
import { ParsedTileType } from "../../util/parseTileMap";
import { RoomObject } from "../RoomObject";
import { IRoomPart } from "./parts/IRoomPart";
import { RoomPartData } from "./parts/RoomPartData";
import { getMaskId } from "./util/getMaskId";

interface WallCollectionMeta {
  type: "rowWall" | "colWall";
  start: number;
  end: number;
  level: number;
}

type Unsubscribe = () => void;

export class Landscape extends RoomObject implements IRoomPart {
  private _container: PIXI.Container | undefined;
  private _leftTexture: PIXI.Texture | undefined;
  private _rightTexture: PIXI.Texture | undefined;
  private _wallHeight = 0;
  private _wallHeightWithZ = 0;

  private _leftTexturePromise: PIXI.Texture | Promise<PIXI.Texture> | undefined;
  private _rightTexturePromise:
    | PIXI.Texture
    | Promise<PIXI.Texture>
    | undefined;

  private _masks: Map<string, PIXI.Sprite> = new Map();
  private _color: string | undefined;
  private _unsubscribe: Unsubscribe | undefined = undefined;

  private _partNode: PartNode | undefined;

  constructor() {
    super();
  }

  public get color() {
    return this._color;
  }

  public set color(value) {
    this._color = value;
    this._updateLandscapeImages();
  }

  public get leftTexture() {
    return this._leftTexturePromise;
  }

  public set leftTexture(value) {
    this._leftTexturePromise = value;
    Promise.resolve(this._leftTexturePromise).then((value) => {
      this._leftTexture = value;
      this._updateLandscapeImages();
    });
  }

  public get rightTexture() {
    return this._rightTexturePromise;
  }

  public set rightTexture(value) {
    this._rightTexturePromise = value;
    Promise.resolve(this._rightTexturePromise).then((value) => {
      this._rightTexture = value;
      this._updateLandscapeImages();
    });
  }

  update(data: RoomPartData): void {
    this._masks = data.masks;
    this._wallHeightWithZ = data.wallHeight;

    this._updateLandscapeImages();
  }

  destroyed(): void {
    this._unsubscribe && this._unsubscribe();
    this._container?.destroy();
    this._partNode?.remove();
  }

  registered(): void {
    this._partNode = this.roomVisualization.addPart(this);
    this._updateLandscapeImages();
  }

  private _createDefaultMask() {
    return new PIXI.Graphics();
  }

  private _getMask(direction: number, roomX: number, roomY: number) {
    const maskId = getMaskId(direction, roomX, roomY);

    if (maskId != null) {
      const mask = this._masks.get(maskId);

      if (mask != null) return mask;
    }

    return this._createDefaultMask();
  }

  private _updateLandscapeImages() {
    if (!this.mounted) return;

    const meta = getWallCollectionMeta(this.tilemap.getParsedTileTypes());
    this._container?.destroy();
    const container = new PIXI.Container();

    let offsetRow = 0;
    let offsetCol = 0;

    meta.forEach((meta) => {
      const width = Math.abs(meta.end - meta.start) * 32;

      const wall = new PIXI.Container();

      const colored = new PIXI.TilingSprite(
        PIXI.Texture.WHITE,
        width,
        this._wallHeightWithZ
      );

      if (this.color != null) {
        colored.tint = parseInt(this.color.slice(1), 16);
      } else {
        colored.tint = 0xffffff;
      }

      colored.y = -this._wallHeightWithZ;

      wall.addChild(colored);

      if (meta.type === "rowWall") {
        const maskLevel = this.landscapeContainer.getMaskLevel(meta.level, 0);

        const mask = this._getMask(2, maskLevel.roomX, 0);
        wall.mask = mask;

        const position = this.geometry.getPosition(
          meta.level + 1,
          meta.start,
          0
        );

        wall.transform.setFromMatrix(new PIXI.Matrix(1, -0.5, 0, 1));

        wall.x = position.x;
        wall.y = position.y + 16;

        if (this._leftTexture != null) {
          const graphics = new PIXI.TilingSprite(
            this._leftTexture,
            width,
            this._leftTexture.height
          );

          graphics.tilePosition = new PIXI.Point(offsetRow, 0);
          graphics.texture = this._leftTexture;
          graphics.x = 0;
          graphics.y = -this._leftTexture.height;
          wall.addChild(graphics);
        }

        offsetRow += width;
      } else if (meta.type === "colWall") {
        const maskLevel = this.landscapeContainer.getMaskLevel(0, meta.level);
        const mask = this._getMask(4, 0, maskLevel.roomY);
        wall.mask = mask;

        const position = this.geometry.getPosition(
          meta.start + 1,
          meta.level + 1,
          0
        );

        wall.transform.setFromMatrix(new PIXI.Matrix(1, 0.5, 0, 1));

        wall.x = position.x + 32;
        wall.y = position.y;

        if (this._rightTexture != null) {
          const graphics = new PIXI.TilingSprite(
            this._rightTexture,
            width,
            this._rightTexture.height
          );
          graphics.texture = this._rightTexture;
          graphics.x = 0;
          graphics.y = -this._rightTexture.height;
          graphics.tilePosition = new PIXI.Point(offsetCol, 0);
          wall.addChild(graphics);
        }

        offsetCol += width;
      }

      container.addChild(wall);
    });

    this._container = container;

    this.roomVisualization.landscapeContainer.addChild(container);
  }
}

const getTile = (parsedTileMap: ParsedTileType[][], x: number, y: number) => {
  const row = parsedTileMap[y];
  if (row == null) return;

  return row[x];
};

function getWallCollectionMeta(parsedTileMap: ParsedTileType[][]) {
  const { x: startX, y: startY } = getStartingWall(parsedTileMap);

  let x = startX;
  let y = startY;
  let done = false;
  let meta: WallCollectionMeta | undefined = undefined;
  const arr: WallCollectionMeta[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const currentWall = getTile(parsedTileMap, x, y);

    const topWallPosition = { x, y: y - 1 };
    const rightWallPosition = { x: x + 1, y };

    const topWall = getTile(
      parsedTileMap,
      topWallPosition.x,
      topWallPosition.y
    );
    const rightWall = getTile(
      parsedTileMap,
      rightWallPosition.x,
      rightWallPosition.y
    );

    if (
      currentWall == null ||
      (currentWall.type !== "wall" && currentWall.type !== "door")
    )
      break;

    const updateMeta = (newMeta: WallCollectionMeta) => {
      if (meta == null) {
        meta = newMeta;
        return;
      }

      if (meta != null && meta.type !== newMeta.type) {
        arr.push(meta);
        meta = newMeta;
        return;
      }

      meta = {
        ...meta,
        level: newMeta.level,
        end: newMeta.end,
      };
    };

    if (currentWall.type === "wall") {
      switch (currentWall.kind) {
        case "rowWall":
        case "innerCorner":
          updateMeta({ type: "rowWall", start: y, end: y - 1, level: x });
          break;

        case "colWall":
        case "outerCorner":
          updateMeta({
            type: "colWall",
            start: x,
            end: x + (done ? 0 : 1),
            level: y,
          });
          break;
      }
    } else if (currentWall.type === "door") {
      updateMeta({ type: "rowWall", start: y, end: y - 1, level: x });
    }

    if (done) {
      if (meta != null) {
        arr.push(meta);
      }
      break;
    }

    if (
      topWall != null &&
      (topWall.type === "wall" || topWall.type === "door")
    ) {
      x = topWallPosition.x;
      y = topWallPosition.y;
    } else if (rightWall != null && rightWall.type === "wall") {
      x = rightWallPosition.x;
      y = rightWallPosition.y;
    } else {
      done = true;
    }
  }

  return arr;
}

function getStartingWall(parsedTileMap: ParsedTileType[][]) {
  const startY = parsedTileMap.length - 1;
  let y = startY;
  let x = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const current = getTile(parsedTileMap, x, y);

    if (current != null && current.type === "wall") {
      return { x, y };
    } else {
      y--;
      if (y < 0) {
        y = startY;
        x++;
      }
    }
  }
}
