import * as PIXI from "pixi.js";
import { IAnimationTicker } from "./IAnimationTicker";

import { IFurnitureLoader } from "./IFurnitureLoader";
import { IRoomGeometry } from "./IRoomGeometry";
import { IRoomObject } from "./IRoomObject";
import { Room } from "./Room";
import { RoomObject } from "./RoomObject";
import { Asset, DrawPart } from "./util/furniture";
import { LoadFurniResult } from "./util/furniture/loadFurni";
import { Layer } from "./util/furniture/visualization/parseLayers";
import { getZOrder } from "./util/getZOrder";

export class Furniture extends RoomObject {
  private sprites: PIXI.DisplayObject[] = [];
  private loadFurniResult: LoadFurniResult | undefined;

  private animatedSprites: {
    sprites: Map<string, PIXI.Sprite>;
    frames: string[];
  }[] = [];

  private spriteCache: Map<string, PIXI.Sprite> = new Map();

  private getSprite(name: string) {}

  private cancelTicker: (() => void) | undefined = undefined;

  constructor(
    private type: string,
    private direction: number,
    private animation: string = "0",
    private position: { roomX: number; roomY: number; roomZ: number }
  ) {
    super();
  }

  setDirection(direction: number) {
    this.direction = direction;
    this.updateFurniture();
  }

  updateFurniture() {
    const { geometry } = this.getRoomContext();

    if (this.loadFurniResult != null) {
      this.updateSprites(
        geometry,
        this.loadFurniResult,
        this.type,
        this.direction,
        this.animation
      );
    }
  }

  updateSprites(
    room: IRoomGeometry,
    loadFurniResult: LoadFurniResult,
    type: string,
    direction: number,
    animation?: string
  ) {
    const { container } = this.getRoomContext();

    const { animationTicker } = this.getRoomContext();

    this.destroySprites();
    const { parts } = loadFurniResult.getDrawDefinition(
      type,
      direction,
      animation
    );

    if (animation != null) {
      this.cancelTicker = animationTicker.subscribe((frame) =>
        this.setCurrentFrame(frame)
      );
    }

    const position = room.getPosition(
      this.position.roomX,
      this.position.roomY,
      this.position.roomZ
    );

    parts.forEach((part, index) => {
      const sprite = this.createAssetFromPart(
        part,
        position,
        loadFurniResult.getAsset,
        index
      );

      if (sprite.kind === "simple") {
        this.sprites.push(sprite.sprite);
        container.addChild(sprite.sprite);
      } else if (sprite.kind === "animated") {
        this.animatedSprites.push(sprite);
        const sprites = [...sprite.sprites.values()];

        container.addChild(...sprites);
      }
    });

    this.setCurrentFrame(animationTicker.current());
  }

  private setCurrentFrame(frame: number) {
    this.animatedSprites.forEach((animatedSprite) => {
      const previousFrameIndex = (frame - 1) % animatedSprite.frames.length;
      const frameIndex = frame % animatedSprite.frames.length;

      const frameIdPrevious = animatedSprite.frames[previousFrameIndex];
      const frameIdCurrent = animatedSprite.frames[frameIndex];

      const previous = animatedSprite.sprites.get(frameIdPrevious);
      const current = animatedSprite.sprites.get(frameIdCurrent);

      if (previous) {
        previous.visible = false;
      }

      if (current) {
        current.visible = true;
      }
    });
  }

  private createSprite(
    asset: Asset,
    layer: Layer | undefined,
    {
      x,
      y,
      zIndex,
      tint,
      shadow = false,
    }: { x: number; y: number; zIndex: number; tint?: string; shadow?: boolean }
  ): PIXI.Sprite {
    const sprite = new PIXI.Sprite();

    const scaleX = asset.flipH ? -1 : 1;
    sprite.x = x + (32 - asset.x * scaleX);
    sprite.y = y - asset.y + 16;
    sprite.zIndex = zIndex;
    sprite.scale = new PIXI.Point(scaleX, 1);
    if (tint != null) {
      sprite.tint = parseInt(tint, 16);
    }

    if (layer != null) {
      if (layer.alpha != null) {
        sprite.alpha = layer.alpha / 255;
      }

      if (layer.ink != null) {
        sprite.blendMode =
          layer.ink === "ADD" ? PIXI.BLEND_MODES.ADD : PIXI.BLEND_MODES.NORMAL;
      }
    }

    if (shadow) {
      sprite.alpha = 0.195;
    }

    if (!shadow && layer?.alpha == null && layer?.ink == null) {
      sprite.cacheAsBitmap = true;
    }

    return sprite;
  }

  private createAssetFromPart(
    { asset, shadow, tint, layer, z, assets }: DrawPart,
    { x, y }: { x: number; y: number },
    getAsset: (name: string) => PIXI.Texture,
    index: number
  ):
    | { kind: "simple"; sprite: PIXI.Sprite }
    | {
        kind: "animated";
        sprites: Map<string, PIXI.Sprite>;
        frames: string[];
      } {
    const getAssetTextureName = (asset: Asset) => asset.source ?? asset.name;

    const getAssetTexture = (asset: Asset) =>
      getAsset(asset.source ?? asset.name);

    const zIndex =
      getZOrder(this.position.roomX, this.position.roomY, this.position.roomZ) +
      (z ?? 0) +
      index * 0.01;

    if (isNaN(zIndex)) {
      console.log("DATA", asset, z, layer);
      throw new Error("invalid zindex");
    }

    if (assets == null || assets.length === 1) {
      const actualAsset =
        assets != null && assets.length === 1 ? assets[0] : asset;

      if (actualAsset != null) {
        const sprite = this.createSprite(actualAsset, layer, {
          x,
          y,
          zIndex,
          shadow,
          tint,
        });
        sprite.texture = getAssetTexture(actualAsset);

        return { kind: "simple", sprite };
      }

      return { kind: "simple", sprite: new PIXI.Sprite() };
    }

    const sprites = new Map<string, PIXI.Sprite>();

    assets.forEach((spriteFrame) => {
      const name = getAssetTextureName(spriteFrame);
      if (sprites.has(name)) return;

      const sprite = this.createSprite(spriteFrame, layer, {
        x,
        y,
        zIndex,
        tint,
        shadow,
      });

      sprite.texture = getAssetTexture(spriteFrame);
      sprite.visible = false;

      sprites.set(name, sprite);
    });

    return {
      kind: "animated",
      sprites: sprites,
      frames: assets.map((asset) => getAssetTextureName(asset)),
    };
  }

  destroySprites() {
    this.sprites.forEach((sprite) => sprite.destroy());
    this.animatedSprites.forEach((sprite) =>
      sprite.sprites.forEach((sprite) => sprite.destroy())
    );

    this.sprites = [];
    this.animatedSprites = [];
  }

  registered(): void {
    const { container } = this.getRoomContext();

    this.getRoomContext()
      .furnitureLoader.loadFurni(this.type)
      .then((result) => {
        this.loadFurniResult = result;
        this.updateFurniture();
      });

    this.updateFurniture();
  }

  destroy() {
    this.destroySprites();

    if (this.cancelTicker != null) {
      this.cancelTicker();
    }
  }
}
