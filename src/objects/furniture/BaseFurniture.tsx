import * as PIXI from "pixi.js";
import { ClickHandler } from "../ClickHandler";
import { HitEvent } from "../../interfaces/IHitDetection";
import { HitSprite } from "../hitdetection/HitSprite";

import { RoomObject } from "../RoomObject";
import { DrawPart } from "./util/DrawDefinition";
import { IFurnitureEventHandlers } from "./util/IFurnitureEventHandlers";
import { LoadFurniResult } from "./util/loadFurni";
import { Asset } from "./util/parseAssets";
import { Layer } from "./util/visualization/parseLayers";
import { HitTexture } from "../hitdetection/HitTexture";
import { MaskNode } from "../../interfaces/IRoomVisualization";
import { HighlightFilter } from "./filter/HighlightFilter";
import { FurnitureFetch } from "../../interfaces/IFurnitureLoader";

const highlightFilter = new HighlightFilter(0x999999, 0xffffff);

type MaskIdGetter = (direction: number) => string | undefined;

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
  private _type: FurnitureFetch;
  private _unknownTexture: PIXI.Texture | undefined;
  private _clickHandler = new ClickHandler();

  private _highlight: boolean = false;

  private _doubleClickInfo?: {
    initialEvent: HitEvent;
    timeout: number;
  };

  public get highlight() {
    return this._highlight;
  }

  public set highlight(value) {
    this._highlight = value;
    this.updateFurniture();
  }

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

  private _maskNodes: MaskNode[] = [];

  private cancelTicker: (() => void) | undefined = undefined;

  private _getMaskId: MaskIdGetter;

  public get maskId() {
    return this._getMaskId;
  }

  public set maskId(value) {
    this._getMaskId = value;
  }

  constructor(
    type: FurnitureFetch,
    direction: number,
    animation: string = "0",
    getMaskId: MaskIdGetter = () => undefined
  ) {
    super();
    this._direction = direction;
    this._animation = animation;
    this._type = type;
    this._getMaskId = getMaskId;
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
    type: FurnitureFetch,
    direction: number,
    animation?: string
  ) {
    this.destroySprites();

    const { parts } = loadFurniResult.getDrawDefinition(direction, animation);

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
          const maskId = this.maskId(this.direction);

          if (maskId != null) {
            this.visualization.addMask(maskId, sprite.sprite);
          }
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
    texture: HitTexture,
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
      mirrored: asset.flipH,
      tag: layer?.tag,
    });

    sprite.hitTexture = texture;

    if (layer?.ignoreMouse !== "1") {
      sprite.addEventListener("click", (event) =>
        this._clickHandler.handleClick(event)
      );
    }

    const highlight = this.highlight && layer?.ink == null && !shadow && !mask;

    if (highlight) {
      sprite.filters = [highlightFilter];
    } else {
      sprite.filters = [];
    }

    const scaleX = asset.flipH ? -1 : 1;
    sprite.x = x + (32 - asset.x * scaleX);
    sprite.y = y - asset.y + 16;
    sprite.zIndex = zIndex;

    if (tint != null) {
      sprite.tint = parseInt(tint, 16);
    }

    if (layer != null) {
      if (layer.alpha != null) {
        if (this.highlight) {
          sprite.alpha = 1;
        } else {
          sprite.alpha = layer.alpha / 255;
        }
      }

      if (layer.ink != null) {
        if (this.highlight) {
          sprite.visible = false;
        }
        sprite.blendMode =
          layer.ink === "ADD" ? PIXI.BLEND_MODES.ADD : PIXI.BLEND_MODES.NORMAL;
      }
    }

    if (shadow) {
      if (this.highlight) {
        sprite.visible = false;
      } else {
        sprite.visible = true;
        sprite.alpha = 0.195;
      }
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

    const getTexture = (asset: Asset) =>
      loadFurniResult.getTexture(getAssetTextureName(asset));

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
          getTexture(actualAsset),
          {
            x,
            y,
            zIndex,
            shadow,
            tint,
            mask,
          }
        );
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
      const texture = getTexture(spriteFrame);
      const name = getAssetTextureName(spriteFrame);
      if (sprites.has(name)) return;

      const sprite = this.createSprite(spriteFrame, layer, texture, {
        x,
        y,
        zIndex,
        tint,
        shadow,
      });

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
    this._maskNodes.forEach((node) => node.remove());

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

  destroyed() {
    this.destroySprites();

    if (this.cancelTicker != null) {
      this.cancelTicker();
    }
  }
}
