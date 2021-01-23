import * as PIXI from "pixi.js";
import {
  AvatarAsset,
  AvatarDrawDefinition,
  AvatarDrawPart,
} from "./util/getAvatarDrawDefinition";
import { LookOptions } from "./util/createLookServer";
import {
  AvatarLoaderResult,
  IAvatarLoader,
} from "../../interfaces/IAvatarLoader";
import { ClickHandler } from "../hitdetection/ClickHandler";
import { HitSprite } from "../hitdetection/HitSprite";
import { isSetEqual } from "../../util/isSetEqual";
import { IHitDetection } from "../../interfaces/IHitDetection";
import { IAnimationTicker } from "../../interfaces/IAnimationTicker";
import { Shroom } from "../Shroom";
import { AvatarFigurePartType } from "./enum/AvatarFigurePartType";

const bodyPartTypes: Set<AvatarFigurePartType> = new Set<AvatarFigurePartType>([
  AvatarFigurePartType.Head,
  AvatarFigurePartType.Body,
  AvatarFigurePartType.LeftHand,
  AvatarFigurePartType.RightHand,
]);
const headPartTypes: Set<AvatarFigurePartType> = new Set([
  AvatarFigurePartType.Head,
  AvatarFigurePartType.Face,
  AvatarFigurePartType.Eyes,
  AvatarFigurePartType.EyeAccessory,
  AvatarFigurePartType.Hair,
  AvatarFigurePartType.HairBig,
  AvatarFigurePartType.FaceAccessory,
  AvatarFigurePartType.HeadAccessory,
  AvatarFigurePartType.HeadAccessoryExtra,
]);

export interface BaseAvatarOptions {
  look: LookOptions;
  position: { x: number; y: number };
  zIndex: number;
  skipBodyParts?: boolean;
  skipCaching?: boolean;
  headOnly?: boolean;
  onLoad?: () => void;
}

export interface BaseAvatarDependencies {
  hitDetection: IHitDetection;
  animationTicker: IAnimationTicker;
  avatarLoader: IAvatarLoader;
}

export class BaseAvatar extends PIXI.Container {
  private _container: PIXI.Container | undefined;
  private _avatarLoaderResult: AvatarLoaderResult | undefined;
  private _avatarDrawDefinition: AvatarDrawDefinition | undefined;

  private _lookOptions: LookOptions | undefined;
  private _nextLookOptions: LookOptions | undefined;

  private _skipBodyParts: boolean;
  private _headOnly: boolean;
  private _skipCaching: boolean;

  private _currentFrame = 0;
  private _clickHandler: ClickHandler = new ClickHandler();

  private _refreshFrame = false;
  private _refreshLook = false;

  private _sprites: Map<string, HitSprite> = new Map();

  private _updateId = 0;
  private _spritesZIndex = 0;

  private _dependencies?: BaseAvatarDependencies;
  private _onLoad: (() => void) | undefined;

  private _cancelTicker: (() => void) | undefined;

  /**
   * Sprite Z-Index for hit detection
   */
  public get spritesZIndex() {
    return this._spritesZIndex;
  }

  public set spritesZIndex(value) {
    this._spritesZIndex = value;
    this._updateSpritesZIndex();
  }

  public get dependencies() {
    if (this._dependencies == null)
      throw new Error("Invalid dependencies in BaseAvatar");

    return this._dependencies;
  }

  public set dependencies(value) {
    this._dependencies = value;
    this._handleDependenciesSet();
  }

  private get mounted() {
    return this._dependencies != null;
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

  get onPointerDown() {
    return this._clickHandler.onPointerDown;
  }

  set onPointerDown(value) {
    this._clickHandler.onPointerDown = value;
  }

  get onPointerUp() {
    return this._clickHandler.onPointerUp;
  }

  set onPointerUp(value) {
    this._clickHandler.onPointerUp = value;
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

  constructor(options: BaseAvatarOptions) {
    super();
    this.x = options.position.x;
    this.y = options.position.y;
    this.zIndex = options.zIndex;
    this.spritesZIndex = options.zIndex;
    this._nextLookOptions = options.look;
    this._onLoad = options.onLoad;
    this._skipBodyParts = options.skipBodyParts ?? false;
    this._headOnly = options.headOnly ?? false;
    this._skipCaching = options.skipCaching ?? false;
  }

  static fromShroom(shroom: Shroom, options: BaseAvatarOptions) {
    const avatar = new BaseAvatar({ ...options });
    avatar.dependencies = shroom.dependencies;
    return avatar;
  }

  destroy(): void {
    super.destroy();
    this._destroyAssets();

    if (this._cancelTicker != null) {
      this._cancelTicker();
    }
  }

  private _destroyAssets() {
    this._sprites.forEach((sprite) => sprite.destroy());
    this._sprites = new Map();
    this._container?.destroy();
  }

  private _updateSpritesZIndex() {
    this._sprites.forEach((sprite) => {
      sprite.zIndex = this.spritesZIndex;
    });
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
      oldLookOptions.effect != newLookOptions.effect ||
      oldLookOptions.direction != newLookOptions.direction ||
      oldLookOptions.headDirection != newLookOptions.headDirection
    ) {
      this._nextLookOptions = newLookOptions;
      this._refreshLook = true;
    }
  }

  private _updatePosition(definition: AvatarDrawDefinition) {
    if (this._container == null) return;

    this._container.x = definition.offsetX;
    this._container.y = definition.offsetY;
  }

  private _updateSprites() {
    if (this._avatarLoaderResult == null) return;
    if (this._lookOptions == null) return;

    const definition = this._avatarLoaderResult.getDrawDefinition(
      this._lookOptions
    );

    this._avatarDrawDefinition = definition;

    this._updateSpritesWithAvatarDrawDefinition(definition, this.currentFrame);
    this._updatePosition(definition);
  }

  private _updateSpritesWithAvatarDrawDefinition(
    drawDefinition: AvatarDrawDefinition,
    currentFrame: number
  ) {
    if (!this.mounted) return;

    this._sprites.forEach((value) => {
      value.visible = false;
      value.ignore = true;
    });
    this._container?.destroy();

    this._container = new PIXI.Container();

    drawDefinition.parts.forEach((part) => {
      const figurePart = part.type as AvatarFigurePartType;
      if (this._skipBodyParts && bodyPartTypes.has(figurePart)) {
        return;
      }

      if (this._headOnly && !headPartTypes.has(figurePart)) {
        return;
      }

      const frame = currentFrame % part.assets.length;
      const asset = part.assets[frame];

      let sprite = this._sprites.get(asset.fileId);

      if (sprite == null) {
        sprite = this._createAsset(part, asset);
      }

      if (sprite == null) return;

      sprite.x = asset.x;
      sprite.y = asset.y;
      sprite.visible = true;
      sprite.mirrored = asset.mirror;
      sprite.ignore = false;
      sprite.zIndex = this.spritesZIndex;

      this._sprites.set(asset.fileId, sprite);
      this._container?.addChild(sprite);
    });

    this.addChild(this._container);
  }

  private _createAsset(part: AvatarDrawPart, asset: AvatarAsset) {
    if (this._avatarLoaderResult == null)
      throw new Error(
        "Cant create asset when avatar loader result not present"
      );
    const texture = this._avatarLoaderResult.getTexture(asset.fileId);

    if (texture == null) return;

    const sprite = new HitSprite({
      hitDetection: this.dependencies.hitDetection,
      mirrored: asset.mirror,
      group: this,
    });

    sprite.hitTexture = texture;

    sprite.x = asset.x;
    sprite.y = asset.y;
    sprite.addEventListener("click", (event) => {
      this._clickHandler.handleClick(event);
    });

    sprite.addEventListener("pointerdown", (event) => {
      this._clickHandler.handlePointerDown(event);
    });

    sprite.addEventListener("pointerup", (event) => {
      this._clickHandler.handlePointerUp(event);
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

    const lookOptions = this._nextLookOptions;

    if (lookOptions != null) {
      const requestId = ++this._updateId;

      this.dependencies.avatarLoader
        .getAvatarDrawDefinition({
          ...lookOptions,
          initial: true,
          skipCaching: this._skipCaching,
        })
        .then((result) => {
          if (requestId !== this._updateId) return;

          this._avatarLoaderResult = result;

          this._lookOptions = lookOptions;
          this._nextLookOptions = undefined;

          // Clear sprite cache, since colors could have changed
          this._destroyAssets();

          this._updateSprites();
          this._onLoad && this._onLoad();
        });
    }
  }

  private _updateFrame() {
    if (this._avatarDrawDefinition == null) return;

    this._updateSpritesWithAvatarDrawDefinition(
      this._avatarDrawDefinition,
      this.currentFrame
    );
    this._updatePosition(this._avatarDrawDefinition);
  }

  private _handleDependenciesSet(): void {
    this._reloadLook();

    if (this._cancelTicker != null) {
      this._cancelTicker();
    }

    this._cancelTicker = this.dependencies.animationTicker.subscribe(() => {
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
}
