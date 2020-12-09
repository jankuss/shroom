import { RoomObject } from "../RoomObject";
import * as PIXI from "pixi.js";
import {
  AvatarDrawDefinition,
  AvatarDrawPart,
} from "./util/getAvatarDrawDefinition";
import { LookOptions } from "./util/createLookServer";
import { AvatarLoaderResult } from "../../interfaces/IAvatarLoader";
import { ClickHandler } from "../ClickHandler";
import { HitSprite } from "../hitdetection/HitSprite";

interface Options {
  look: LookOptions;
  position: { x: number; y: number };
  zIndex: number;
}

export class AvatarSprites extends RoomObject {
  private container: PIXI.Container | undefined;
  private avatarLoaderResult: AvatarLoaderResult | undefined;
  private avatarDrawDefinition: AvatarDrawDefinition | undefined;

  private _lookOptions: LookOptions;
  private _x: number = 0;
  private _y: number = 0;
  private _zIndex: number = 0;
  private _currentFrame: number = 0;
  private _clickHandler: ClickHandler = new ClickHandler();
  private _assets: PIXI.Sprite[] = [];

  private _layer: "door" | "tile" = "tile";

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
    return this._lookOptions;
  }

  set lookOptions(lookOptions) {
    this._lookOptions = lookOptions;
    this._updateSprites();
  }

  get currentFrame() {
    return this._currentFrame;
  }

  set currentFrame(value) {
    this._currentFrame = value;
    this._updateSprites();
  }

  constructor(options: Options) {
    super();

    this._x = options.position.x;
    this._y = options.position.y;
    this._zIndex = options.zIndex;
    this._lookOptions = options.look;
  }

  private _updateLayer(
    oldLayer: "door" | "tile" | undefined,
    newLayer: "door" | "tile"
  ) {
    if (this.container == null) return;
    if (oldLayer === newLayer) return;

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

    this._assets.forEach((value) => value.destroy());
    this._assets = [];
    this.container?.destroy();

    this.container = new PIXI.Container();

    const definition = this.avatarLoaderResult.getDrawDefinition(
      this.lookOptions
    );

    this.avatarDrawDefinition = definition;
    this._updatePosition(definition);

    this.container.scale = new PIXI.Point(
      definition.mirrorHorizontal ? -1 : 1,
      1
    );

    definition.parts.forEach((part) => {
      const asset = this.createAsset(part, definition.mirrorHorizontal);
      if (asset == null) return;

      this.container?.addChild(asset);
      this._assets.push(asset);
    });

    this._updateLayer(undefined, this.layer);
  }

  private createAsset(part: AvatarDrawPart, mirrored: boolean) {
    if (this.avatarLoaderResult == null)
      throw new Error(
        "Cant create asset when avatar loader result not present"
      );
    const texture = this.avatarLoaderResult.getTexture(part.fileId);

    if (texture == null) return;

    const sprite = new HitSprite({
      hitDetection: this.hitDetection,
      mirroredNotVisually: mirrored,
    });

    sprite.zIndex = this.zIndex;
    sprite.hitTexture = texture;

    sprite.x = part.x;
    sprite.y = part.y;
    sprite.addEventListener("click", (event) => {
      this._clickHandler.handleClick(event);
    });

    if (part.color != null && part.mode === "colored") {
      sprite.tint = parseInt(part.color.slice(1), 16);
    }

    return sprite;
  }

  private fetchLook(look: string) {
    this.avatarLoader.getAvatarDrawDefinition(look).then((result) => {
      this.avatarLoaderResult = result;
      this._updateSprites();
    });

    this._updateSprites();
  }

  registered(): void {
    this.fetchLook(this.lookOptions.look);
  }

  destroy(): void {
    this.container?.destroy();
  }
}
