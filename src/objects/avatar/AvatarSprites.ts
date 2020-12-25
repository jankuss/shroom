import { RoomObject } from "../RoomObject";
import * as PIXI from "pixi.js";
import {
  AvatarAsset,
  AvatarDrawDefinition,
  AvatarDrawPart,
} from "./util/getAvatarDrawDefinition";
import { LookOptions } from "./util/createLookServer";
import { AvatarLoaderResult } from "../../interfaces/IAvatarLoader";
import { ClickHandler } from "../ClickHandler";
import { HitSprite } from "../hitdetection/HitSprite";
import { isSetEqual } from "../../util/isSetEqual";

interface Options {
  look: LookOptions;
  position: { x: number; y: number };
  zIndex: number;
}

export class AvatarSprites extends RoomObject {
  private container: PIXI.Container | undefined;
  private avatarLoaderResult: AvatarLoaderResult | undefined;
  private avatarDrawDefinition: AvatarDrawDefinition | undefined;

  private _lookOptions: LookOptions | undefined;
  private _nextLookOptions: LookOptions | undefined;

  private _x: number = 0;
  private _y: number = 0;
  private _zIndex: number = 0;
  private _currentFrame: number = 0;
  private _clickHandler: ClickHandler = new ClickHandler();
  private _assets: PIXI.Sprite[] = [];

  private _refreshFrame = false;
  private _refreshLook = false;

  private _sprites: Map<string, PIXI.Sprite> = new Map();

  private _layer: "door" | "tile" = "tile";
  private _updateId = 0;

  public get layer() {
    return this._layer;
  }

  public set layer(value) {
    this._updateLayer(this._layer, value);

    this._layer = value;
  }

  get onClick() {
    return this._clickHandler.onClick;
  }

  set onClick(value) {
    this._clickHandler.onClick = value;
  }

  get onDoubleClick() {
    return this._clickHandler.onDoubleClick;
  }

  set onDoubleClick(value) {
    this._clickHandler.onDoubleClick = value;
  }

  get x() {
    return this._x;
  }

  set x(value) {
    this._x = value;
    this._positionChanged();
  }

  get y() {
    return this._y;
  }

  set y(value) {
    this._y = value;
    this._positionChanged();
  }

  get zIndex() {
    return this._zIndex;
  }

  set zIndex(value) {
    if (value === this._zIndex) return;

    this._zIndex = value;
    this._positionChanged();
  }

  get lookOptions() {
    if (this._nextLookOptions != null) {
      return this._nextLookOptions;
    }

    if (this._lookOptions == null) throw new Error("Invalid look options");

    return this._lookOptions;
  }

  set lookOptions(lookOptions) {
    this._updateLookOptions(this._lookOptions, lookOptions);
  }

  get currentFrame() {
    return this._currentFrame;
  }

  set currentFrame(value) {
    if (value === this._currentFrame) {
      return;
    }

    this._currentFrame = value;
    this._refreshFrame = true;
  }

  constructor(options: Options) {
    super();

    this._x = options.position.x;
    this._y = options.position.y;
    this._zIndex = options.zIndex;
    this._nextLookOptions = options.look;
  }

  private _updateLookOptions(
    oldLookOptions: LookOptions | undefined,
    newLookOptions: LookOptions
  ) {
    if (
      oldLookOptions == null ||
      !isSetEqual(oldLookOptions.actions, newLookOptions.actions) ||
      oldLookOptions.look != newLookOptions.look ||
      oldLookOptions.item != newLookOptions.item ||
      oldLookOptions.effect != newLookOptions.effect
    ) {
      this._nextLookOptions = newLookOptions;
      this._refreshLook = true;
    }
  }

  private _updateLayer(
    oldLayer: "door" | "tile" | undefined,
    newLayer: "door" | "tile"
  ) {
    if (oldLayer === newLayer) return;
    this._updateLayerOfCurrentContainer(newLayer);
  }

  private _updateLayerOfCurrentContainer(newLayer: "door" | "tile") {
    if (this.container == null) return;
    this.visualization.removeBehindWallChild(this.container);
    this.visualization.removeContainerChild(this.container);

    if (newLayer === "door") {
      this.visualization.addBehindWallChild(this.container);
      return;
    }

    this.visualization.addContainerChild(this.container);
  }

  private _positionChanged() {
    if (this.avatarDrawDefinition == null) return;
    this._updatePosition(this.avatarDrawDefinition);
  }

  private _updatePosition(definition: AvatarDrawDefinition) {
    if (this.container == null) return;

    this.container.x = this.x + definition.offsetX;
    this.container.y = this.y + definition.offsetY;
    this.container.zIndex = this.zIndex;
  }

  private _updateSprites() {
    if (this.avatarLoaderResult == null) return;
    if (this._lookOptions == null) return;

    const definition = this.avatarLoaderResult.getDrawDefinition(
      this._lookOptions
    );

    this.avatarDrawDefinition = definition;

    this._updateSpritesWithAvatarDrawDefinition(definition, this.currentFrame);
    this._updatePosition(definition);

    this._updateLayer(undefined, this.layer);
  }

  private _updateSpritesWithAvatarDrawDefinition(
    drawDefinition: AvatarDrawDefinition,
    currentFrame: number
  ) {
    this._assets.forEach((value) => (value.visible = false));
    this.container?.destroy();

    this.container = new PIXI.Container();

    drawDefinition.parts.forEach((part) => {
      const frame = currentFrame % part.assets.length;
      const asset = part.assets[frame];

      const sprite = this.createAsset(part, asset);

      if (sprite == null) return;

      sprite.x = asset.x;
      sprite.y = asset.y;
      sprite.visible = true;

      this._sprites.set(asset.fileId, sprite);
      this.container?.addChild(sprite);
    });
  }

  private createAsset(part: AvatarDrawPart, asset: AvatarAsset) {
    if (this.avatarLoaderResult == null)
      throw new Error(
        "Cant create asset when avatar loader result not present"
      );
    const texture = this.avatarLoaderResult.getTexture(asset.fileId);

    if (texture == null) return;

    const sprite = new HitSprite({
      hitDetection: this.hitDetection,
      mirrored: asset.mirror,
    });

    sprite.zIndex = this.zIndex;
    sprite.hitTexture = texture;

    sprite.x = asset.x;
    sprite.y = asset.y;
    sprite.addEventListener("click", (event) => {
      this._clickHandler.handleClick(event);
    });

    if (part.color != null && part.mode === "colored") {
      sprite.tint = parseInt(part.color.slice(1), 16);
    } else {
      sprite.tint = 0xffffff;
    }

    return sprite;
  }

  private _reloadLook() {
    if (!this.mounted) return;

    const requestId = ++this._updateId;

    this.avatarLoader
      .getAvatarDrawDefinition({ ...this.lookOptions, initial: true })
      .then((result) => {
        if (requestId !== this._updateId) return;

        this.avatarLoaderResult = result;

        if (this._nextLookOptions != null) {
          this._lookOptions = this._nextLookOptions;
          this._nextLookOptions = undefined;
        }

        this._updateSprites();
      });
  }

  private _updateFrame() {
    if (this.avatarDrawDefinition == null) return;

    this._updateSpritesWithAvatarDrawDefinition(
      this.avatarDrawDefinition,
      this.currentFrame
    );
    this._updatePosition(this.avatarDrawDefinition);
    this._updateLayerOfCurrentContainer(this.layer);
  }

  registered(): void {
    this._reloadLook();

    this.animationTicker.subscribe(() => {
      if (this._refreshLook) {
        this._refreshLook = false;
        this._reloadLook();
      }

      if (this._refreshFrame) {
        this._refreshFrame = false;
        this._updateFrame();
      }
    });
  }

  destroyed(): void {
    this.container?.destroy();
  }
}
