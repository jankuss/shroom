import * as PIXI from "pixi.js";
import { IAnimationTicker } from "./IAnimationTicker";

import { IFurnitureLoader } from "./IFurnitureLoader";
import { IRoomGeometry } from "./IRoomGeometry";
import { Room } from "./Room";
import { Asset, DrawPart } from "./util/furniture";
import { LoadFurniResult } from "./util/furniture/loadFurni";
import { Layer } from "./util/furniture/visualization/parseLayers";
import { getZOrder } from "./util/getZOrder";

export class Furniture {
  private sprites: PIXI.DisplayObject[] = [];
  private loadFurniResult: LoadFurniResult | undefined;
  private parent: Room | undefined;

  private animatedSprites: { frames: PIXI.Sprite[] }[] = [];

  private cancelTicker: (() => void) | undefined = undefined;

  constructor(
    private animationTicker: IAnimationTicker,
    private furnitureLoader: IFurnitureLoader,
    private type: string,
    private direction: number,
    private animation: string = "0",
    private position: { roomX: number; roomY: number }
  ) {
    this.furnitureLoader.loadFurni(type).then((result) => {
      this.loadFurniResult = result;
      this.updateFurniture();
    });
  }

  setDirection(direction: number) {
    this.direction = direction;
    this.updateFurniture();
  }

  updateFurniture() {
    if (this.loadFurniResult != null && this.parent != null) {
      this.updateSprites(
        this.parent,
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
    this.destroySprites();
    const { parts } = loadFurniResult.getDrawDefinition(
      type,
      direction,
      animation
    );

    if (animation != null) {
      this.cancelTicker = this.animationTicker.subscribe((frame) =>
        this.setCurrentFrame(frame)
      );
    }

    const position = room.getPosition(
      this.position.roomX,
      this.position.roomY,
      0
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
      } else if (sprite.kind === "animated") {
        this.animatedSprites.push({ frames: sprite.sprites });
        this.sprites.push(...sprite.sprites);
      }
    });

    this.sprites.forEach((sprite) => {
      this.parent?.addChild(sprite);
    });

    this.animatedSprites.forEach((animatedSprite) => {
      this.parent?.addChild(...animatedSprite.frames);
    });

    this.setCurrentFrame(this.animationTicker.current());
  }

  private setCurrentFrame(frame: number) {
    this.animatedSprites.forEach((animatedSprite) => {
      const previousFrameIndex = (frame - 1) % animatedSprite.frames.length;
      const frameIndex = frame % animatedSprite.frames.length;

      animatedSprite.frames[previousFrameIndex].visible = false;
      animatedSprite.frames[frameIndex].visible = true;
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
        sprite.alpha = layer.alpha;
      }

      if (layer.ink != null) {
        sprite.blendMode =
          layer.ink === "ADD" ? PIXI.BLEND_MODES.ADD : PIXI.BLEND_MODES.NORMAL;
      }
    }

    if (shadow) {
      sprite.alpha = 0.195;
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
    | { kind: "animated"; sprites: PIXI.Sprite[] } {
    const getAssetTexture = (asset: Asset) =>
      getAsset(asset.source ?? asset.name);

    const zIndex =
      getZOrder(this.position.roomX, this.position.roomY, 0) +
      (z ?? 0) +
      index * 0.01;

    if (assets == null || assets.length === 1) {
      const actualAsset =
        assets != null && assets.length === 1 ? assets[0] : asset;

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

    return {
      kind: "animated",
      sprites: assets.map((spriteFrame) => {
        const sprite = this.createSprite(spriteFrame, layer, {
          x,
          y,
          zIndex,
          tint,
          shadow,
        });

        sprite.texture = getAssetTexture(spriteFrame);
        sprite.visible = false;

        return sprite;
      }),
    };
  }

  destroySprites() {
    this.sprites.forEach((sprite) => sprite.destroy());
    this.sprites = [];
    this.animatedSprites = [];
  }

  setParent(parent: Room): void {
    this.parent = parent;
    this.updateFurniture();
  }

  destroy() {
    this.destroySprites();
    this.parent = undefined;
  }
}
