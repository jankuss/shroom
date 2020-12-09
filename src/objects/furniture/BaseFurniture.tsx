import * as PIXI from "pixi.js";
import { ClickHandler } from "../ClickHandler";
import { HitEvent } from "../../interfaces/IHitDetection";
import { HitSprite } from "../hitdetection/HitSprite";

import { RoomObject } from "../RoomObject";
import { DrawPart } from "./util/DrawDefinition";
import { IFurnitureEventHandlers } from "./util/IFurnitureEventHandlers";
import { Hitmap, LoadFurniResult } from "./util/loadFurni";
import { Asset } from "./util/parseAssets";
import { Layer } from "./util/visualization/parseLayers";

export class BaseFurniture
  extends RoomObject
  implements IFurnitureEventHandlers {
  private sprites: PIXI.DisplayObject[] = [];
  private loadFurniResult: LoadFurniResult | undefined;
  private unknownSprite: PIXI.Sprite | undefined;

  private _x: number = 0;
  private _y: number = 0;
  private _zIndex: number = 0;
  private _direction: number = 0;
  private _animation: string | undefined;
  private _type: string;
  private _unknownTexture: PIXI.Texture | undefined;
  private _clickHandler = new ClickHandler();

  private _doubleClickInfo?: {
    initialEvent: HitEvent;
    timeout: number;
  };

  public get onClick() {
    return this._clickHandler.onClick;
  }

  public set onClick(value) {
    this._clickHandler.onClick = value;
  }

  public get onDoubleClick() {
    return this._clickHandler.onDoubleClick;
  }

  public set onDoubleClick(value) {
    this._clickHandler.onDoubleClick = value;
  }

  public get x() {
    return this._x;
  }

  public set x(value) {
    this._x = value;
    this.updateFurniture();
  }

  public get y() {
    return this._y;
  }

  public set y(value) {
    this._y = value;
    this.updateFurniture();
  }

  public get zIndex() {
    return this._zIndex;
  }

  public set zIndex(value) {
    this._zIndex = value;
    this.updateFurniture();
  }

  public get direction() {
    return this._direction;
  }

  public set direction(value) {
    this._direction = value;
    this.updateFurniture();
  }

  public get animation() {
    return this._animation;
  }

  public set animation(value) {
    this._animation = value;
    this.updateFurniture();
  }

  private animatedSprites: {
    sprites: Map<string, PIXI.Sprite>;
    frames: string[];
  }[] = [];

  private cancelTicker: (() => void) | undefined = undefined;

  constructor(type: string, direction: number, animation: string = "0") {
    super();
    this._direction = direction;
    this._animation = animation;
    this._type = type;
  }

  updateFurniture() {
    if (!this.mounted) return;

    if (this.loadFurniResult != null) {
      this.updateSprites(
        this.loadFurniResult,
        this._type,
        this.direction,
        this.animation
      );
    } else {
      this.updateUnknown();
    }
  }

  updateUnknown() {
    this.destroySprites();

    this.unknownSprite = new PIXI.Sprite(this._unknownTexture);
    this.unknownSprite.x = this.x;
    this.unknownSprite.y = this.y - 32;
    this.unknownSprite.zIndex = this.zIndex;

    this.visualization.addContainerChild(this.unknownSprite);
    this.sprites.push(this.unknownSprite);
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
        loadFurniResult,
        index
      );

      if (sprite.kind === "simple" || sprite.kind === "mask") {
        this.sprites.push(sprite.sprite);

        if (sprite.kind === "mask") {
          this.visualization.addMask(sprite.sprite);
        } else {
          this.visualization.addContainerChild(sprite.sprite);
        }
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
    getHitmap: () => Hitmap,
    {
      x,
      y,
      zIndex,
      tint,
      shadow = false,
      mask = false,
    }: {
      x: number;
      y: number;
      zIndex: number;
      tint?: string;
      shadow?: boolean;
      mask?: boolean;
    }
  ): PIXI.Sprite {
    const sprite = new HitSprite({
      hitDetection: this.hitDetection,
      getHitmap: getHitmap,
      mirrored: asset.flipH,
      tag: layer?.tag,
    });

    if (layer?.ignoreMouse !== "1") {
      sprite.addEventListener("click", (event) =>
        this._clickHandler.handleClick(event)
      );
    }

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

    if (mask) {
      sprite.tint = 0xffffff;
    }

    return sprite;
  }

  private createAssetFromPart(
    { asset, shadow, tint, layer, z, assets, mask }: DrawPart,
    { x, y }: { x: number; y: number },
    loadFurniResult: LoadFurniResult,
    index: number
  ):
    | { kind: "simple" | "mask"; sprite: PIXI.Sprite }
    | {
        kind: "animated";
        sprites: Map<string, PIXI.Sprite>;
        frames: string[];
      } {
    const getAssetTextureName = (asset: Asset) => asset.source ?? asset.name;

    const getAssetTexture = (asset: Asset) =>
      loadFurniResult.getAsset(getAssetTextureName(asset));

    const getAssetHitMap = (asset: Asset) =>
      loadFurniResult.getHitMap(getAssetTextureName(asset));

    const zIndex = this.zIndex + (z ?? 0) + index * 0.01;

    if (isNaN(zIndex)) {
      throw new Error("invalid zindex");
    }

    if (assets == null || assets.length === 1) {
      const actualAsset =
        assets != null && assets.length === 1 ? assets[0] : asset;

      if (actualAsset != null) {
        const sprite = this.createSprite(
          actualAsset,
          layer,
          () => getAssetHitMap(actualAsset),
          {
            x,
            y,
            zIndex,
            shadow,
            tint,
            mask,
          }
        );
        sprite.texture = getAssetTexture(actualAsset);

        if (mask != null && mask) {
          return { kind: "mask", sprite };
        } else {
          return { kind: "simple", sprite };
        }
      }

      return { kind: "simple", sprite: new PIXI.Sprite() };
    }

    const sprites = new Map<string, PIXI.Sprite>();

    assets.forEach((spriteFrame) => {
      const hitmap = getAssetHitMap(spriteFrame);
      const name = getAssetTextureName(spriteFrame);
      if (sprites.has(name)) return;

      const sprite = this.createSprite(
        spriteFrame,
        layer,
        () => getAssetHitMap(spriteFrame),
        {
          x,
          y,
          zIndex,
          tint,
          shadow,
        }
      );

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
    this._unknownTexture = this.configuration.placeholder ?? undefined;

    this.furnitureLoader.loadFurni(this._type).then((result) => {
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
