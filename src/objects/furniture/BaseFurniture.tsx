import * as PIXI from "pixi.js";

import { ClickHandler } from "../hitdetection/ClickHandler";
import { HitSprite } from "../hitdetection/HitSprite";
import { FurniDrawPart } from "./util/DrawDefinition";
import { IFurnitureEventHandlers } from "./util/IFurnitureEventHandlers";
import { LoadFurniResult } from "./util/loadFurni";
import { HitTexture } from "../hitdetection/HitTexture";
import { MaskNode } from "../../interfaces/IRoomVisualization";
import { HighlightFilter } from "./filter/HighlightFilter";
import {
  FurnitureFetch,
  IFurnitureLoader,
} from "../../interfaces/IFurnitureLoader";
import { FurnitureAsset } from "./data/interfaces/IFurnitureAssetsData";
import { FurnitureLayer } from "./data/interfaces/IFurnitureVisualizationData";
import { IAnimationTicker } from "../../interfaces/IAnimationTicker";
import { IHitDetection } from "../../interfaces/IHitDetection";
import { IRoomContext } from "../../interfaces/IRoomContext";
import { Shroom } from "../Shroom";
import { IFurnitureVisualization } from "./IFurnitureVisualization";
import { FurnitureSprite } from "./FurnitureSprite";
import { AnimatedFurnitureVisualization } from "./visualization/AnimatedFurnitureVisualization";

const highlightFilter = new HighlightFilter(0x999999, 0xffffff);

type MaskIdGetter = (direction: number) => string | undefined;

export type SpriteWithStaticOffset = {
  x: number;
  y: number;
  sprite: PIXI.Sprite;
  zIndex?: number;
};

interface BaseFurnitureDependencies {
  placeholder: PIXI.Texture | undefined;
  visualization: IFurnitureRoomVisualization;
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
  private _sprites: Map<string, FurnitureSprite> = new Map();
  private loadFurniResult: LoadFurniResult | undefined;
  private unknownSprite: FurnitureSprite | undefined;

  private _x: number = 0;
  private _y: number = 0;
  private _zIndex: number = 0;
  private _direction: number = 0;
  private _animation: string | undefined;
  private _type: FurnitureFetch;
  private _unknownTexture: PIXI.Texture | undefined;
  private _unknownSprite: FurnitureSprite | undefined;
  private _clickHandler = new ClickHandler();
  private _loadFurniResultPromise: Promise<LoadFurniResult>;
  private _resolveLoadFurniResult: (result: LoadFurniResult) => void = () => {};

  private _visualization: IFurnitureVisualization | undefined;
  private _fallbackVisualization = new AnimatedFurnitureVisualization();

  private _refreshPosition: boolean = false;
  private _refreshFurniture: boolean = false;
  private _refreshZIndex: boolean = false;

  private _highlight: boolean = false;
  private _alpha: number = 1;
  private _destroyed: boolean = false;

  private _frameCount: number | undefined;

  private _maskNodes: MaskNode[] = [];
  private _cancelTicker: (() => void) | undefined = undefined;
  private _getMaskId: MaskIdGetter;

  private _dependencies?: {
    placeholder: PIXI.Texture | undefined;
    visualization: IFurnitureRoomVisualization;
    animationTicker: IAnimationTicker;
    furnitureLoader: IFurnitureLoader;
    hitDetection: IHitDetection;
  };

  public get dependencies() {
    if (this._dependencies == null) throw new Error("Invalid dependencies");

    return this._dependencies;
  }

  public get visualization() {
    if (this._visualization == null) return this._fallbackVisualization;

    return this._visualization;
  }

  public set visualization(value) {
    this._visualization?.destroy();
    this._visualization = value;
    this._updateFurniture();
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
    this.visualization.updateDirection(this.direction);
  }

  public get animation() {
    return this._animation;
  }

  public set animation(value) {
    this._animation = value;
    this.visualization.updateAnimation(this.animation);
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

  private _updateSprites(cb: (element: FurnitureSprite) => void) {
    this._sprites.forEach(cb);

    if (this._unknownSprite != null) {
      cb(this._unknownSprite);
    }
  }

  private _updateZIndex() {
    this._updateSprites((element: FurnitureSprite) => {
      element.baseZIndex = this.zIndex;
    });
  }

  private _updatePosition() {
    this._updateSprites((element: FurnitureSprite) => {
      element.baseX = this.x;
      element.baseY = this.y;
    });
  }

  _updateFurniture() {
    if (!this.mounted) return;

    if (this.loadFurniResult != null) {
      this._updateFurnitureSprites(this.loadFurniResult);
    } else {
      this._updateUnknown();
    }
  }

  _updateUnknown() {
    if (!this.mounted) return;

    if (this._unknownSprite == null) {
      this._unknownSprite = new FurnitureSprite({
        hitDetection: this.dependencies.hitDetection,
      });

      this._unknownSprite.baseX = this.x;
      this._unknownSprite.baseY = this.y;

      this._unknownSprite.offsetY = -32;

      if (this._unknownTexture != null) {
        this._unknownSprite.texture = this._unknownTexture;
      }

      this._unknownSprite.zIndex = this.zIndex;
      this.dependencies.visualization.container.addChild(this._unknownSprite);
      this._updatePosition();
    }
  }

  private _createSimpleAsset(
    loadFurniResult: LoadFurniResult,
    part: FurniDrawPart,
    asset: FurnitureAsset
  ) {
    const { z, assets, layer, shadow, tint, mask, layerIndex } = part;

    const getAssetTextureName = (asset: FurnitureAsset) =>
      asset.source ?? asset.name;

    const getTexture = (asset: FurnitureAsset) =>
      loadFurniResult.getTexture(getAssetTextureName(asset));

    const zIndex = (z ?? 0) + layerIndex * 0.01;

    if (isNaN(zIndex)) {
      throw new Error("invalid zindex");
    }

    const texture = getTexture(asset);
    if (texture == null) return;

    const sprite = this._createSprite(asset, layer, texture, part);

    sprite.assetName = asset.name;

    if (mask == null || !mask) {
      this.dependencies.visualization.container.addChild(sprite);
    } else {
      const maskId = this._getMaskId(this.direction);
      if (maskId != null) {
        this.dependencies.visualization.addMask(maskId, sprite);
      }
    }

    return sprite;
  }

  _updateFurnitureSprites(loadFurniResult: LoadFurniResult) {
    if (!this.mounted) return;

    this._unknownSprite?.destroy();
    this._unknownSprite = undefined;

    this.visualization.setView({
      furniture: loadFurniResult,
      createSprite: (part, assetIndex) => {
        const asset = getAssetFromPart(part, assetIndex);
        if (asset == null) return;

        let cachedAsset = this._sprites.get(asset.name);
        if (cachedAsset == null) {
          const sprite = this._createSimpleAsset(loadFurniResult, part, asset);

          if (sprite != null) {
            this._sprites.set(asset.name, sprite);
            cachedAsset = sprite;
          }
        }

        if (cachedAsset != null) {
          this._applyLayerDataToSprite(cachedAsset, asset, part);
        }

        return cachedAsset;
      },
      destroySprite: (sprite) => {
        if (sprite.assetName == null) return;

        this._sprites.delete(sprite.assetName);
        sprite.destroy();
      },
    });

    this.visualization.update(this);

    this.visualization.updateDirection(this.direction);
    this.visualization.updateAnimation(this.animation);
    this.visualization.updateFrame(this.dependencies.animationTicker.current());
  }

  private _applyLayerDataToSprite(
    sprite: FurnitureSprite,
    asset: FurnitureAsset,
    { layer, shadow = false, mask = false, z: zIndex = 0, tint }: FurniDrawPart
  ) {
    const highlight = this.highlight && layer?.ink == null && !shadow && !mask;

    if (highlight) {
      sprite.filters = [highlightFilter];
    } else {
      sprite.filters = [];
    }

    const scaleX = asset.flipH ? -1 : 1;

    const offsetX = +(32 - asset.x * scaleX);
    const offsetY = -asset.y + 16;

    sprite.offsetX = offsetX;
    sprite.offsetY = offsetY;
    sprite.offsetZIndex = zIndex;

    sprite.baseX = this.x;
    sprite.baseY = this.y;
    sprite.baseZIndex = this.zIndex;

    if (shadow) {
      sprite.baseZIndex = this.zIndex;
      sprite.offsetZIndex = -this.zIndex;
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
        sprite.alpha = 0;
      } else {
        sprite.visible = true;
        sprite.alpha = alpha / 5;
      }
    } else {
      sprite.visible = true;
      sprite.alpha = alpha;
    }

    if (mask) {
      sprite.tint = 0xffffff;
    }

    if (!mask) {
      // TODO: Figure out why this is needed. If we don't do this the alpha value of the sprite isn't correct for some reason.
      sprite.setParent(this.dependencies.visualization.container);
    }
  }

  private _createSprite(
    asset: FurnitureAsset,
    layer: FurnitureLayer | undefined,
    texture: HitTexture,
    part: FurniDrawPart
  ): FurnitureSprite {
    const sprite = new FurnitureSprite({
      hitDetection: this.dependencies.hitDetection,
      mirrored: asset.flipH,
      tag: layer?.tag,
    });

    if (layer?.ignoreMouse !== true) {
      sprite.addEventListener("click", (event) =>
        this._clickHandler.handleClick(event)
      );
    }

    sprite.hitTexture = texture;

    this._applyLayerDataToSprite(sprite, asset, part);

    return sprite;
  }

  destroySprites() {
    this._sprites.forEach((sprite) => sprite.destroy());
    this._unknownSprite?.destroy();
    this._sprites = new Map();
  }

  private _loadFurniture() {
    if (!this.mounted) return;

    this._unknownTexture = this.dependencies.placeholder ?? undefined;

    this.dependencies.furnitureLoader.loadFurni(this._type).then((result) => {
      if (this._destroyed) return;

      this.loadFurniResult = result;
      this._resolveLoadFurniResult(result);
      this._updateFurniture();
    });

    this._updateFurniture();

    this._cancelTicker && this._cancelTicker();
    this._cancelTicker = this.dependencies.animationTicker.subscribe(
      (frame) => {
        this.visualization.updateFrame(frame);
      }
    );
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

    this._destroyed = true;
    PIXI.Ticker.shared.remove(this._onTicker);
    this._cancelTicker && this._cancelTicker();
    this._cancelTicker = undefined;
  }
}

function getAssetFromPart(part: FurniDrawPart, assetIndex: number) {
  const asset = part.assets != null ? part.assets[assetIndex] : undefined;
  if (asset == null) return;

  return asset;
}

export interface IFurnitureRoomVisualization {
  container: PIXI.Container;
  addMask(maskId: string, element: PIXI.DisplayObject): void;
}
