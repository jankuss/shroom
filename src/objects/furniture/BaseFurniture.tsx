import * as PIXI from "pixi.js";

import { IRoomGeometry } from "../../IRoomGeometry";
import { RoomObject } from "../../RoomObject";
import { Asset, DrawPart } from "../../util/furniture";
import { LoadFurniResult } from "../../util/furniture/loadFurni";
import { Layer } from "../../util/furniture/visualization/parseLayers";
import { getZOrder } from "../../util/getZOrder";

export class BaseFurniture extends RoomObject {
  private sprites: PIXI.DisplayObject[] = [];
  private loadFurniResult: LoadFurniResult | undefined;

  private x: number = 0;
  private y: number = 0;
  private zIndex: number = 0;

  private animatedSprites: {
    sprites: Map<string, PIXI.Sprite>;
    frames: string[];
  }[] = [];

  private cancelTicker: (() => void) | undefined = undefined;

  constructor(
    private type: string,
    private direction: number,
    private animation: string = "0"
  ) {
    super();
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.updateFurniture();
  }

  setZIndex(zIndex: number) {
    this.zIndex = zIndex;
    this.updateFurniture();
  }

  setDirection(direction: number) {
    this.direction = direction;
    this.updateFurniture();
  }

  updateFurniture() {
    if (this.loadFurniResult != null) {
      this.updateSprites(
        this.loadFurniResult,
        this.type,
        this.direction,
        this.animation
      );
    }
  }

  updateSprites(
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

    parts.forEach((part, index) => {
      const sprite = this.createAssetFromPart(
        part,
        { x: this.x, y: this.y },
        loadFurniResult.getAsset,
        index
      );

      if (sprite.kind === "simple") {
        this.sprites.push(sprite.sprite);
        this.visualization.addContainerChild(sprite.sprite);
      } else if (sprite.kind === "animated") {
        this.animatedSprites.push(sprite);
        const sprites = [...sprite.sprites.values()];

        sprites.forEach((sprite) => {
          this.visualization.addContainerChild(sprite);
        });
      }
    });

    this.setCurrentFrame(this.animationTicker.current());
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
      console.log(sprite);
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

    const zIndex = this.zIndex + (z ?? 0) + index * 0.01;

    if (isNaN(zIndex)) {
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
    this.furnitureLoader.loadFurni(this.type).then((result) => {
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
