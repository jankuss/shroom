import * as PIXI from "pixi.js";

import { IHitDetection } from "../../interfaces/IHitDetection";
import { ClickHandler } from "../hitdetection/ClickHandler";
import { HitTexture } from "../hitdetection/HitTexture";
import { BaseFurniture, IFurnitureRoomVisualization } from "./BaseFurniture";
import { FurnitureAsset } from "./data/interfaces/IFurnitureAssetsData";
import { FurnitureLayer } from "./data/interfaces/IFurnitureVisualizationData";
import { HighlightFilter } from "./filter/HighlightFilter";
import { FurnitureSprite } from "./FurnitureSprite";
import { IFurnitureVisualizationView } from "./IFurnitureVisualizationView";
import { DrawPart } from "./util";
import { FurniDrawPart } from "./util/DrawDefinition";
import { LoadFurniResult } from "./util/loadFurni";

const highlightFilter = new HighlightFilter(0x999999, 0xffffff);

export class BaseFurnitureView implements IFurnitureVisualizationView {
  private _sprites: Map<string, FurnitureSprite> = new Map();

  constructor(
    private readonly baseFurniture: BaseFurniture,
    public readonly furniture: LoadFurniResult,
    private visualization: IFurnitureRoomVisualization,
    private hitDetection: IHitDetection,
    private clickHandler: ClickHandler
  ) {}

  public get container() {
    return this.visualization.container;
  }

  addMask(id: string, element: PIXI.DisplayObject) {
    this.visualization.addMask(id, element);
  }

  createSprite(part: DrawPart, index: number): FurnitureSprite | undefined {
    const asset = getAssetFromDrawPart(part, index);
    if (asset == null) {
      // Asset index is out of bounds
      return;
    }

    let cachedSprite = this._sprites.get(asset.name);
    if (cachedSprite == null) {
      cachedSprite = this._createSimpleAsset(this.furniture, part, index);

      if (cachedSprite != null) {
        this._sprites.set(asset.name, cachedSprite);
      }
    } else if (cachedSprite != null) {
      this._applyLayerDataToSprite(cachedSprite, asset, part);
    }

    return cachedSprite;
  }

  destroySprite(sprite: FurnitureSprite): void {
    const assetName = sprite.assetName;
    if (assetName == null) return;

    const existing = this._sprites.get(assetName);
    existing?.destroy();

    this._sprites.delete(assetName);
  }

  public updatePosition() {
    this._sprites.forEach((sprite) => {
      sprite.baseX = this.baseFurniture.x;
      sprite.baseY = this.baseFurniture.y;
    });
  }

  public updateZIndex() {
    this._sprites.forEach((sprite) => {
      sprite.baseZIndex = this.baseFurniture.zIndex;
    });
  }

  private _createSimpleAsset(
    loadFurniResult: LoadFurniResult,
    part: FurniDrawPart,
    spriteIndex: number
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

    const actualAsset = assets && assets[spriteIndex];
    if (actualAsset == null) return;

    const texture = getTexture(actualAsset);
    if (texture == null) return;

    const sprite = this._createSprite(actualAsset, layer, texture, part);

    sprite.assetName = actualAsset.name;

    return sprite;
  }

  private _createSprite(
    asset: FurnitureAsset,
    layer: FurnitureLayer | undefined,
    texture: HitTexture,
    part: FurniDrawPart
  ): FurnitureSprite {
    const sprite = new FurnitureSprite({
      hitDetection: this.hitDetection,
      mirrored: asset.flipH,
      tag: layer?.tag,
    });

    if (layer?.ignoreMouse !== true) {
      sprite.addEventListener("click", (event) =>
        this.clickHandler.handleClick(event)
      );
    }

    sprite.hitTexture = texture;

    this._applyLayerDataToSprite(sprite, asset, part);

    return sprite;
  }

  private _applyLayerDataToSprite(
    sprite: FurnitureSprite,
    asset: FurnitureAsset,
    { layer, shadow = false, mask = false, z: zIndex = 0, tint }: FurniDrawPart
  ) {
    const highlight =
      this.baseFurniture.highlight && layer?.ink == null && !shadow && !mask;

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

    sprite.baseX = this.baseFurniture.x;
    sprite.baseY = this.baseFurniture.y;
    sprite.baseZIndex = this.baseFurniture.zIndex;

    if (shadow) {
      sprite.baseZIndex = this.baseFurniture.zIndex;
      sprite.offsetZIndex = -this.baseFurniture.zIndex;
    }

    if (tint != null) {
      sprite.tint = parseInt(tint, 16);
    }

    let alpha = this._getAlpha({
      baseAlpha: this.baseFurniture.alpha,
      layerAlpha: layer?.alpha,
    });

    if (layer != null) {
      if (layer.ink != null) {
        if (this.baseFurniture.highlight) {
          sprite.visible = false;
        }
        sprite.blendMode =
          layer.ink === "ADD" ? PIXI.BLEND_MODES.ADD : PIXI.BLEND_MODES.NORMAL;
      }
    }

    if (shadow) {
      if (this.baseFurniture.highlight) {
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
}

function getAssetFromDrawPart(part: FurniDrawPart, assetIndex: number) {
  const asset = part.assets != null ? part.assets[assetIndex] : undefined;
  if (asset == null) return;

  return asset;
}
