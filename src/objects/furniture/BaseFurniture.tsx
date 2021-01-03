import * as PIXI from "pixi.js";

import { ClickHandler } from "../hitdetection/ClickHandler";
import { HitSprite } from "../hitdetection/HitSprite";
import { DrawPart } from "./util/DrawDefinition";
import { IFurnitureEventHandlers } from "./util/IFurnitureEventHandlers";
import { LoadFurniResult } from "./util/loadFurni";
import { Asset } from "./util/parseAssets";
import { Layer } from "./util/visualization/parseLayers";
import { HitTexture } from "../hitdetection/HitTexture";
import { MaskNode } from "../../interfaces/IRoomVisualization";
import { HighlightFilter } from "./filter/HighlightFilter";
import {
  FurnitureFetch,
  IFurnitureLoader,
} from "../../interfaces/IFurnitureLoader";
import { getDirectionForFurniture } from "./util/getDirectionForFurniture";
import { IAnimationTicker } from "../../interfaces/IAnimationTicker";
import { IHitDetection } from "../../interfaces/IHitDetection";
import { IRoomContext } from "../../interfaces/IRoomContext";
import { Shroom } from "../Shroom";

const highlightFilter = new HighlightFilter(0x999999, 0xffffff);

type MaskIdGetter = (direction: number) => string | undefined;

type SpriteWithStaticOffset = {
  x: number;
  y: number;
  sprite: PIXI.Sprite;
  zIndex?: number;
};

interface BaseFurnitureDependencies {
  placeholder: PIXI.Texture | undefined;
  visualization: IFurnitureVisualization;
  animationTicker: IAnimationTicker;
  furnitureLoader: IFurnitureLoader;
  hitDetection: IHitDetection;
}

export interface BaseFurnitureProps {
  type: FurnitureFetch;
  direction: number;
  animation: string | undefined;
  getMaskId?: MaskIdGetter;
}

export class BaseFurniture implements IFurnitureEventHandlers {
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

  private animatedSprites: {
    sprites: Map<string, SpriteWithStaticOffset>;
    frames: string[];
  }[] = [];

  private _maskNodes: MaskNode[] = [];
  private _cancelTicker: (() => void) | undefined = undefined;
  private _getMaskId: MaskIdGetter;

  private _dependencies?: {
    placeholder: PIXI.Texture | undefined;
    visualization: IFurnitureVisualization;
    animationTicker: IAnimationTicker;
    furnitureLoader: IFurnitureLoader;
    hitDetection: IHitDetection;
  };

  public get dependencies() {
    if (this._dependencies == null) throw new Error("Invalid dependencies");

    return this._dependencies;
  }

  public set dependencies(value) {
    this._dependencies = value;
    this._loadFurniture();
  }

  public get mounted() {
    return this._dependencies != null;
  }

  static fromRoomContext(context: IRoomContext, props: BaseFurnitureProps) {
    return new BaseFurniture({
      dependencies: {
        placeholder: context.configuration.placeholder,
        animationTicker: context.animationTicker,
        furnitureLoader: context.furnitureLoader,
        hitDetection: context.hitDetection,
        visualization: context.visualization,
      },
      ...props,
    });
  }

  static fromShroom(
    shroom: Shroom,
    container: PIXI.Container,
    props: BaseFurnitureProps
  ) {
    return new BaseFurniture({
      dependencies: {
        animationTicker: shroom.dependencies.animationTicker,
        furnitureLoader: shroom.dependencies.furnitureLoader,
        hitDetection: shroom.dependencies.hitDetection,
        placeholder: shroom.dependencies.configuration.placeholder,
        visualization: {
          container,
          addMask: () => {},
        },
      },
      ...props,
    });
  }

  constructor({
    type,
    direction,
    animation = "0",
    getMaskId = () => undefined,
    dependencies,
  }: {
    dependencies?: BaseFurnitureDependencies;
  } & BaseFurnitureProps) {
    this._direction = direction;
    this._animation = animation;
    this._type = type;
    this._getMaskId = getMaskId;

    if (dependencies != null) {
      this.dependencies = dependencies;
    }

    PIXI.Ticker.shared.add(this._onTicker);

    this._loadFurniResultPromise = new Promise<LoadFurniResult>((resolve) => {
      this._resolveLoadFurniResult = resolve;
    });
  }

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
    this._animation = value;
    this._refreshFurniture = true;
  }

  public get maskId() {
    return this._getMaskId;
  }

  public set maskId(value) {
    this._getMaskId = value;
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
      this._updateFurnitureSprites(
        this.loadFurniResult,
        this.direction,
        this.animation
      );
    } else {
      this._updateUnknown();
    }
  }

  _updateUnknown() {
    if (!this.mounted) return;

    this.destroySprites();

    this.unknownSprite = new PIXI.Sprite(this._unknownTexture);
    const x = this.x;
    const y = this.y - 32;

    this.unknownSprite.x = x;
    this.unknownSprite.y = y;
    this.unknownSprite.zIndex = this.zIndex;

    this.dependencies.visualization.container.addChild(this.unknownSprite);
    this.elements.push({ sprite: this.unknownSprite, x, y, zIndex: 0 });
  }

  _updateFurnitureSprites(
    loadFurniResult: LoadFurniResult,
    direction: number,
    animation?: string
  ) {
    if (!this.mounted) return;

    this.destroySprites();

    const { parts } = loadFurniResult.getDrawDefinition(
      getDirectionForFurniture(direction, loadFurniResult.directions),
      animation
    );

    if (animation != null) {
      this._cancelTicker = this.dependencies.animationTicker.subscribe(
        (frame) => this._setCurrentFrame(frame)
      );
    }

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
            this.dependencies.visualization.addMask(
              maskId,
              asset.sprite.sprite
            );
          }
        } else {
          this.dependencies.visualization.container.addChild(
            asset.sprite.sprite
          );
        }
      } else if (asset.kind === "animated") {
        this.animatedSprites.push(asset);
        const sprites = [...asset.sprites.values()];

        sprites.forEach((sprite) => {
          this.dependencies.visualization.container.addChild(sprite.sprite);
        });
      }
    });

    this._setCurrentFrame(this.dependencies.animationTicker.current());
  }

  private _setCurrentFrame(frame: number) {
    this.animatedSprites.forEach((animatedSprite) => {
      const previousFrameIndex = (frame - 1) % animatedSprite.frames.length;
      const frameIndex = frame % animatedSprite.frames.length;

      const frameIdPrevious = animatedSprite.frames[previousFrameIndex];
      const frameIdCurrent = animatedSprite.frames[frameIndex];

      const previous = animatedSprite.sprites.get(frameIdPrevious);
      const current = animatedSprite.sprites.get(frameIdCurrent);

      if (previous) {
        previous.sprite.visible = false;
      }

      if (current) {
        current.sprite.visible = true;
      }
    });
  }

  private _createSprite(
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
  ): SpriteWithStaticOffset {
    const sprite = new HitSprite({
      hitDetection: this.dependencies.hitDetection,
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
    { asset, shadow, tint, layer, z, assets, mask }: DrawPart,
    { x, y }: { x: number; y: number },
    loadFurniResult: LoadFurniResult,
    index: number
  ):
    | { kind: "simple" | "mask"; sprite: SpriteWithStaticOffset }
    | {
        kind: "animated";
        sprites: Map<string, SpriteWithStaticOffset>;
        frames: string[];
      } {
    const getAssetTextureName = (asset: Asset) => asset.source ?? asset.name;

    const getTexture = (asset: Asset) =>
      loadFurniResult.getTexture(getAssetTextureName(asset));

    const zIndex = (z ?? 0) + index * 0.01;

    if (isNaN(zIndex)) {
      throw new Error("invalid zindex");
    }

    if (assets == null || assets.length === 1) {
      const actualAsset =
        assets != null && assets.length === 1 ? assets[0] : asset;

      if (actualAsset != null) {
        const sprite = this._createSprite(
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
          return { kind: "mask", sprite: sprite };
        } else {
          return { kind: "simple", sprite: sprite };
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

      const sprite = this._createSprite(spriteFrame, layer, texture, {
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

  private _loadFurniture() {
    if (!this.mounted) return;

    this._unknownTexture = this.dependencies.placeholder ?? undefined;

    this.dependencies.furnitureLoader.loadFurni(this._type).then((result) => {
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

  destroy() {
    this.destroySprites();

    if (this._cancelTicker != null) {
      this._cancelTicker();
    }

    PIXI.Ticker.shared.remove(this._onTicker);
  }
}

export interface IFurnitureVisualization {
  container: PIXI.Container;
  addMask(maskId: string, element: PIXI.DisplayObject): void;
}
