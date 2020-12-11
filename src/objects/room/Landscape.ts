import * as PIXI from "pixi.js";
import { ParsedTileType } from "../../util/parseTileMap";
import { RoomObject } from "../RoomObject";
import { ILandscape } from "./ILandscape";
import { Room } from "./Room";
import { RoomLandscapeMaskSprite } from "./RoomLandscapeMaskSprite";

interface WallCollectionMeta {
  type: "rowWall" | "colWall";
  start: number;
  end: number;
  level: number;
}

export class Landscape extends RoomObject implements ILandscape {
  private _container: PIXI.Container | undefined;
  private _leftTexture: PIXI.Texture | undefined;
  private _rightTexture: PIXI.Texture | undefined;

  private _xLevelMasks = new Map<number, PIXI.Sprite>();
  private _yLevelMasks = new Map<number, PIXI.Sprite>();

  private _leftTexturePromise: PIXI.Texture | Promise<PIXI.Texture> | undefined;
  private _rightTexturePromise:
    | PIXI.Texture
    | Promise<PIXI.Texture>
    | undefined;

  public get leftTexture() {
    return this._leftTexturePromise;
  }

  public set leftTexture(value) {
    this._leftTexturePromise = value;
    Promise.resolve(this._leftTexturePromise).then((value) => {
      this._leftTexture = value;
      this._initLandscapeImages();
    });
  }

  public get rightTexture() {
    return this._rightTexturePromise;
  }

  public set rightTexture(value) {
    this._rightTexturePromise = value;
    Promise.resolve(this._rightTexturePromise).then((value) => {
      this._rightTexture = value;
      this._initLandscapeImages();
    });
  }

  constructor(private room: Room) {
    super();
  }

  setYLevelMasks(level: number, mask: PIXI.Sprite): void {
    this._yLevelMasks.set(level, mask);
    this._initLandscapeImages();
  }

  setXLevelMasks(level: number, mask: PIXI.Sprite): void {
    this._xLevelMasks.set(level, mask);
    this._initLandscapeImages();
  }

  private _createDefaultMask() {
    return new PIXI.Graphics();
  }

  private _initLandscapeImages() {
    if (!this.mounted) return;

    const meta = getWallCollectionMeta(this.room.parsedTileMap);

    this._container?.destroy();
    const container = new PIXI.Container();

    let offsetRow = 0;
    let offsetCol = 0;

    meta.forEach((meta) => {
      const width = Math.abs(meta.end - meta.start) * 32;

      if (meta.type === "rowWall" && this._leftTexture != null) {
        const graphics = new PIXI.TilingSprite(
          this._leftTexture,
          width,
          this._leftTexture.height
        );

        const mask =
          this._xLevelMasks.get(meta.level) ?? this._createDefaultMask();
        if (mask != null) {
          container.addChild(mask);
          graphics.mask = mask;
        }

        const position = this.room.getPosition(
          meta.level + 1,
          meta.start,
          0,
          "none"
        );

        graphics.texture = this._leftTexture;

        graphics.transform.setFromMatrix(new PIXI.Matrix(1, -0.5, 0, 1));

        graphics.tilePosition = new PIXI.Point(offsetRow, 0);

        graphics.x = position.x;
        graphics.y = position.y + 16 - this._leftTexture.height;

        offsetRow += width;
        // offsetCol += width;

        container.addChild(graphics);
      } else if (meta.type === "colWall" && this._rightTexture != null) {
        const graphics = new PIXI.TilingSprite(
          this._rightTexture,
          width,
          this._rightTexture.height
        );

        const mask =
          this._yLevelMasks.get(meta.level) ?? this._createDefaultMask();
        if (mask != null) {
          container.addChild(mask);
          graphics.mask = mask;
        }

        const position = this.room.getPosition(
          meta.start + 1,
          meta.level + 1,
          0,
          "none"
        );

        graphics.texture = this._rightTexture;

        graphics.transform.setFromMatrix(new PIXI.Matrix(1, 0.5, 0, 1));

        graphics.tilePosition = new PIXI.Point(offsetCol, 0);

        graphics.x = position.x + 32;
        graphics.y = position.y - this._rightTexture.height;

        //offsetRow += width;
        offsetCol += width;

        container.addChild(graphics);
      }
    });

    this._container = container;

    this.visualization.addLandscape(container);
  }

  destroy(): void {
    this.landscapeContainer.unsetLandscapeIfEquals(this);
  }

  registered(): void {
    this.landscapeContainer.setLandscape(this);
    this._initLandscapeImages();
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

    if (currentWall == null || currentWall.type !== "wall") break;

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

    if (done) {
      if (meta != null) {
        arr.push(meta);
      }
      break;
    }

    if (topWall != null && topWall.type === "wall") {
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

/*function getWallCollectionMeta(parsedTileMap: ParsedTileType[][]) {
  const getTile = (x: number, y: number) => {
    const row = parsedTileMap[y];
    if (row == null) return;

    return row[x];
  };

  const startY = parsedTileMap.length - 1;

  let y = startY;
  let x = 0;

  let trackingWall = false;

  let wallCollectionMeta: WallCollectionMeta | undefined = undefined;
  let done = false;

  const arr: WallCollectionMeta[] = [];

  while (true) {
    const current = getTile(x, y);

    if (!trackingWall) {
      if (current != null && current.type === "wall") {
        trackingWall = true;
      } else {
        y--;
        if (y < 0) {
          y = startY;
          x++;
        }
      }
    } else {
      const currentWall = getTile(x, y);

      if (currentWall != null && currentWall.type === "wall") {
        const kind = (() => {
          switch (currentWall.kind) {
            case "innerCorner":
              return "colWall";
            case "outerCorner":
              return "rowWall";
          }

          return currentWall.kind;
        })();

        if (
          wallCollectionMeta == null ||
          done ||
          ((currentWall.kind === "colWall" ||
            currentWall.kind === "rowWall" ||
            currentWall.kind === "outerCorner" ||
            currentWall.kind === "innerCorner") &&
            kind !== currentWall.kind)
        ) {
          const startNewMeta = (meta: WallCollectionMeta) => {
            if (wallCollectionMeta != null) {
              arr.push(wallCollectionMeta);
            }
            wallCollectionMeta = meta;
          };

          if (
            currentWall.kind === "colWall" ||
            currentWall.kind === "outerCorner"
          ) {
            if (
              wallCollectionMeta == null ||
              wallCollectionMeta.type !== "colWall"
            ) {
              startNewMeta({
                type: "colWall",
                start: x,
                end: x + 1,
                level: y,
              });
            }
          } else if (
            currentWall.kind === "rowWall" ||
            currentWall.kind === "innerCorner"
          ) {
            if (
              wallCollectionMeta == null ||
              wallCollectionMeta.type !== "rowWall"
            ) {
              startNewMeta({
                type: "rowWall",
                start: y,
                end: y - 1,
                level: x,
              });
            }
          }
        } else if (wallCollectionMeta != null) {
          const meta: WallCollectionMeta = wallCollectionMeta;

          if (currentWall.kind === "colWall") {
            wallCollectionMeta = { ...meta, end: x + 1 };
          }
          if (currentWall.kind === "rowWall") {
            wallCollectionMeta = { ...meta, end: y - 1 };
          }
        }

        const topWallPosition = { x, y: y - 1 };
        const rightWallPosition = { x: x + 1, y };

        const topWall = getTile(topWallPosition.x, topWallPosition.y);
        const rightWall = getTile(rightWallPosition.x, rightWallPosition.y);

        if (topWall != null && topWall.type === "wall") {
          x = topWallPosition.x;
          y = topWallPosition.y;
          continue;
        } else if (rightWall != null && rightWall.type === "wall") {
          x = rightWallPosition.x;
          y = rightWallPosition.y;
          continue;
        } else {
          break;
        }
      } else {
      }
    }
  }

  if (wallCollectionMeta != null) {
    arr.push(wallCollectionMeta);
  }

  return arr;
}
*/
