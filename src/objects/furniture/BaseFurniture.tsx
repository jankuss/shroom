import * as PIXI from "pixi.js";

import { ClickHandler } from "../hitdetection/ClickHandler";
import { HitSprite } from "../hitdetection/HitSprite";
import { RoomObject } from "../RoomObject";
import { FurniDrawPart } from "./util/DrawDefinition";
import { IFurnitureEventHandlers } from "./util/IFurnitureEventHandlers";
import { LoadFurniResult } from "./util/loadFurni";
import { HitTexture } from "../hitdetection/HitTexture";
import { MaskNode } from "../../interfaces/IRoomVisualization";
import { HighlightFilter } from "./filter/HighlightFilter";
import { FurnitureFetch } from "../../interfaces/IFurnitureLoader";
import { getDirectionForFurniture } from "./util/getDirectionForFurniture";
import { FurnitureAsset } from "./data/interfaces/IFurnitureAssetsData";
import { FurnitureLayer } from "./data/interfaces/IFurnitureVisualizationData";

const highlightFilter = new HighlightFilter(0x999999, 0xffffff);

type MaskIdGetter = (direction: number) => string | undefined;

type SpriteWithStaticOffset = {
  x: number;
  y: number;
  sprite: PIXI.Sprite;
  zIndex?: number;
};

export class BaseFurniture
  extends RoomObject
  implements IFurnitureEventHandlers {
  private elements: SpriteWithStaticOffset[] = [];
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
  private _loadFurniResultPromise: Promise<LoadFurniResult>;
  private _resolveLoadFurniResult: (result: LoadFurniResult) => void = () => {};

  private _refreshPosition: boolean = false;
  private _refreshFurniture: boolean = false;
  private _refreshZIndex: boolean = false;

  private _highlight: boolean = false;
  private _alpha: number = 1;
  private _frameCount: number | undefined;

  public get extradata() {
    return this._loadFurniResultPromise.then((result) => {
      return result.getExtraData();
    });
  }

  public get validDirections() {
    return this._loadFurniResultPromise.then((result) => {
      return result.directions;
    });
  }

  public get highlight() {
    return this._highlight;
  }

  public set highlight(value) {
    this._highlight = value;
    this._refreshFurniture = true;
  }

  public get alpha() {
    return this._alpha;
  }

  public set alpha(value) {
    this._alpha = value;
    this._refreshFurniture = true;
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
    if (value !== this.x) {
      this._x = value;
      this._refreshPosition = true;
    }
  }

  public get y() {
    return this._y;
  }

  public set y(value) {
    if (value !== this.y) {
      this._y = value;
      this._refreshPosition = true;
    }
  }

  public get zIndex() {
    return this._zIndex;
  }

  public set zIndex(value) {
    if (value !== this.zIndex) {
      this._zIndex = value;
      this._refreshZIndex = true;
    }
  }

  public get direction() {
    return this._direction;
  }

  public set direction(value) {
    this._direction = value;
    this._refreshFurniture = true;
  }

  public get animation() {
    return this._animation;
  }

  public set animation(value) {
    this._animationOverride = undefined;
    this._animation = value;
    this._refreshFurniture = true;
  }

  private _runningAnimation: string | undefined;

  private animatedSprites: {
    sprites: Map<string, SpriteWithStaticOffset>;
    frames: string[];
    frameRepeat: number;
  }[] = [];

  private _animationOverride: string | undefined;

  private _startFrame: number | undefined;

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

    PIXI.Ticker.shared.add(this._onTicker);

    this._loadFurniResultPromise = new Promise<LoadFurniResult>((resolve) => {
      this._resolveLoadFurniResult = resolve;
    });
  }

  private _onTicker = () => {
    if (this._refreshFurniture) {
      this._refreshFurniture = false;
      this._updateFurniture();
    }

    if (this._refreshPosition) {
      this._refreshPosition = false;
      this._updatePosition();
    }

    if (this._refreshZIndex) {
      this._refreshZIndex = false;
      this._updateZIndex();
    }
  };

  private _updateSprites(cb: (element: SpriteWithStaticOffset) => void) {
    this.elements.forEach(cb);
    this.animatedSprites.forEach(({ sprites }) => sprites.forEach(cb));
  }

  private _updateZIndex() {
    this._updateSprites((element: SpriteWithStaticOffset) => {
      if (element.zIndex == null) {
        element.sprite.zIndex = 0;
      } else {
        element.sprite.zIndex = this.zIndex + element.zIndex;
      }
    });
  }

  private _updatePosition() {
    this._updateSprites((element: SpriteWithStaticOffset) => {
      element.sprite.x = this.x + element.x;
      element.sprite.y = this.y + element.y;
    });
  }

  _updateFurniture() {
    if (!this.mounted) return;

    if (this.loadFurniResult != null) {
      this.updateSprites(
        this.loadFurniResult,
        this.direction,
        this._getDisplayAnimation()
      );
    } else {
      this.updateUnknown();
    }
  }

  private _handleAnimation(transitionTo?: number) {
    const newAnimation = this._getDisplayAnimation();
    if (newAnimation != this._runningAnimation) {
      this.cancelTicker && this.cancelTicker();

      this._startFrame = undefined;
      this._runningAnimation = newAnimation;

      let newAnimationNumber: number | undefined = Number(newAnimation);
      if (isNaN(newAnimationNumber)) {
        newAnimationNumber = undefined;
      }

      const transitionToWithFallback = transitionTo ?? newAnimationNumber;

      if (this._frameCount != null) {
        this.cancelTicker = this.animationTicker.subscribe((frame) => {
          this.setCurrentFrame(frame, transitionToWithFallback);
        });
        this.setCurrentFrame(
          this.animationTicker.current(),
          transitionToWithFallback
        );
      }
    } else if (newAnimation == null) {
      this.cancelTicker && this.cancelTicker();

      this._startFrame = undefined;
      this._runningAnimation = undefined;
    }
  }

  updateUnknown() {
    this.destroySprites();

    this.unknownSprite = new PIXI.Sprite(this._unknownTexture);
    const x = this.x;
    const y = this.y - 32;

    this.unknownSprite.x = x;
    this.unknownSprite.y = y;
    this.unknownSprite.zIndex = this.zIndex;

    this.visualization.addContainerChild(this.unknownSprite);
    this.elements.push({ sprite: this.unknownSprite, x, y, zIndex: 0 });
  }

  updateSprites(
    loadFurniResult: LoadFurniResult,
    direction: number,
    animation?: string
  ) {
    this.destroySprites();

    const {
      parts,
      frameCount,
      transitionTo,
    } = loadFurniResult.getDrawDefinition(
      getDirectionForFurniture(direction, loadFurniResult.directions),
      animation
    );

    this._frameCount = frameCount;

    parts.forEach((part, index) => {
      const asset = this.createAssetFromPart(
        part,
        { x: this.x, y: this.y },
        loadFurniResult,
        index
      );

      if (asset.kind === "simple" || asset.kind === "mask") {
        this.elements.push(asset.sprite);

        if (asset.kind === "mask") {
          const maskId = this.maskId(this.direction);

          if (maskId != null) {
            this.visualization.addMask(maskId, asset.sprite.sprite);
          }
        } else {
          this.visualization.addContainerChild(asset.sprite.sprite);
        }
      } else if (asset.kind === "animated") {
        this.animatedSprites.push(asset);
        const sprites = [...asset.sprites.values()];

        sprites.forEach((sprite) => {
          this.visualization.addContainerChild(sprite.sprite);
        });
      }
    });

    this._handleAnimation(transitionTo);
  }

  private _transitionToAnimation(animation: string) {
    this._startFrame = undefined;
    this._animationOverride = animation;

    if (this._runningAnimation !== animation) {
      this._refreshFurniture = true;
    } else {
      this.setCurrentFrame(this.animationTicker.current());
    }
  }

  private _getDisplayAnimation() {
    if (this._animationOverride != null) return this._animationOverride;

    return this.animation;
  }

  private setCurrentFrame(frame: number, transitionTo?: number) {
    const startFrame = this._startFrame ?? frame;
    this._startFrame = startFrame;
    const progress = frame - startFrame;

    let maxFrameCount: number | undefined;

    this.animatedSprites.forEach((animatedSprite) => {
      animatedSprite.sprites.forEach(
        (sprite) => (sprite.sprite.visible = false)
      );
    });

    this.animatedSprites.forEach((animatedSprite) => {
      const frameCount = (this._frameCount ?? 1) * animatedSprite.frameRepeat;
      if (maxFrameCount == null || frameCount > maxFrameCount) {
        maxFrameCount = frameCount;
      }

      let frameIndex = progress;

      if (frameIndex > animatedSprite.frames.length - 1) {
        frameIndex = animatedSprite.frames.length - 1;
      }

      frameIndex = frameIndex % frameCount;

      const frameIdCurrent = animatedSprite.frames[frameIndex];
      const current = animatedSprite.sprites.get(frameIdCurrent);

      if (current) {
        current.sprite.visible = true;
      }
    });

    if (
      maxFrameCount != null &&
      progress >= maxFrameCount &&
      transitionTo != null
    ) {
      this._transitionToAnimation(transitionTo.toString());
      return;
    }
  }

  private createSprite(
    asset: FurnitureAsset,
    layer: FurnitureLayer | undefined,
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
  ): SpriteWithStaticOffset {
    const sprite = new HitSprite({
      hitDetection: this.hitDetection,
      mirrored: asset.flipH,
      tag: layer?.tag,
    });

    sprite.hitTexture = texture;

    if (layer?.ignoreMouse !== true) {
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

    const offsetX = +(32 - asset.x * scaleX);
    const offsetY = -asset.y + 16;

    sprite.x = x + offsetX;
    sprite.y = y + offsetY;

    if (shadow) {
      sprite.zIndex = 0;
    } else {
      sprite.zIndex = this.zIndex + zIndex;
    }

    if (tint != null) {
      sprite.tint = parseInt(tint, 16);
    }

    let alpha = this._getAlpha({
      baseAlpha: this.alpha,
      layerAlpha: layer?.alpha,
    });

    if (layer != null) {
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
        sprite.alpha = alpha / 5;
      }
    } else {
      sprite.alpha = alpha;
    }

    if (mask) {
      sprite.tint = 0xffffff;
    }

    return {
      sprite,
      x: offsetX,
      y: offsetY,
      zIndex: shadow ? undefined : zIndex,
    };
  }

  private createAssetFromPart(
    { asset, shadow, tint, layer, z, assets, mask, frameRepeat }: FurniDrawPart,
    { x, y }: { x: number; y: number },
    loadFurniResult: LoadFurniResult,
    index: number
  ):
    | { kind: "simple" | "mask"; sprite: SpriteWithStaticOffset }
    | {
        kind: "animated";
        sprites: Map<string, SpriteWithStaticOffset>;
        frames: string[];
        frameRepeat: number;
      } {
    const getAssetTextureName = (asset: FurnitureAsset) =>
      asset.source ?? asset.name;

    const getTexture = (asset: FurnitureAsset) =>
      loadFurniResult.getTexture(getAssetTextureName(asset));

    const zIndex = (z ?? 0) + index * 0.01;

    if (isNaN(zIndex)) {
      throw new Error("invalid zindex");
    }

    if (assets == null || assets.length === 1) {
      const actualAsset =
        assets != null && assets.length === 1 ? assets[0] : asset;

      if (actualAsset != null) {
        const texture = getTexture(actualAsset);

        if (texture != null) {
          const sprite = this.createSprite(actualAsset, layer, texture, {
            x,
            y,
            zIndex,
            shadow,
            tint,
            mask,
          });
          if (mask != null && mask) {
            return { kind: "mask", sprite: sprite };
          } else {
            return { kind: "simple", sprite: sprite };
          }
        }
      }

      return {
        kind: "simple",
        sprite: { x: 0, y: 0, sprite: new PIXI.Sprite(), zIndex: 0 },
      };
    }

    const sprites = new Map<string, SpriteWithStaticOffset>();

    assets.forEach((spriteFrame) => {
      const texture = getTexture(spriteFrame);
      const name = getAssetTextureName(spriteFrame);
      if (sprites.has(name)) return;
      if (texture == null) return;

      const sprite = this.createSprite(spriteFrame, layer, texture, {
        x,
        y,
        zIndex,
        tint,
        shadow,
      });

      sprite.sprite.visible = false;

      sprites.set(name, sprite);
    });

    return {
      kind: "animated",
      sprites: sprites,
      frames: assets.map((asset) => getAssetTextureName(asset)),
      frameRepeat,
    };
  }

  destroySprites() {
    this.elements.forEach((sprite) => sprite.sprite.destroy());
    this.animatedSprites.forEach((sprite) =>
      sprite.sprites.forEach((sprite) => sprite.sprite.destroy())
    );
    this._maskNodes.forEach((node) => node.remove());

    this.elements = [];
    this.animatedSprites = [];
  }

  registered(): void {
    this._unknownTexture = this.configuration.placeholder ?? undefined;

    this.furnitureLoader.loadFurni(this._type).then((result) => {
      this.loadFurniResult = result;
      this._resolveLoadFurniResult(result);
      this._updateFurniture();
    });

    this._updateFurniture();
  }

  private _getAlpha({
    layerAlpha,
    baseAlpha,
  }: {
    layerAlpha?: number;
    baseAlpha: number;
  }) {
    if (layerAlpha != null) return (layerAlpha / 255) * baseAlpha;

    return baseAlpha;
  }

  destroyed() {
    this.destroySprites();

    if (this.cancelTicker != null) {
      this.cancelTicker();
    }

    PIXI.Ticker.shared.remove(this._onTicker);
  }
}
