import { RoomObject } from "../RoomObject";
import * as PIXI from "pixi.js";
import {
  AvatarDrawDefinition,
  AvatarDrawPart,
} from "./util/getAvatarDrawDefinition";
import { LookOptions } from "./util/createLookServer";
import { AvatarLoaderResult } from "../../interfaces/IAvatarLoader";

interface Options {
  look: LookOptions;
  position: { x: number; y: number };
  zIndex: number;
}

export class AvatarSprites extends RoomObject {
  private container: PIXI.Container | undefined;
  private avatarLoaderResult: AvatarLoaderResult | undefined;
  private currentFrame: number = 0;
  private mirrored: boolean = true;
  private frame: number = 0;
  private avatarDrawDefinition: AvatarDrawDefinition | undefined;

  private lookOptions: LookOptions;

  private _x: number = 0;
  private _y: number = 0;
  private _zIndex: number = 0;

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
    this._zIndex = value;
    this._positionChanged();
  }

  constructor(private options: Options) {
    super();

    this.x = this.options.position.x;
    this.y = this.options.position.y;
    this._zIndex = options.zIndex;
    this.lookOptions = options.look;
  }

  private _positionChanged() {
    if (this.avatarDrawDefinition == null) return;
    this.updatePosition(this.avatarDrawDefinition);
  }

  setLook(options: LookOptions) {
    this.lookOptions = options;
    this.updateSprites();
  }

  private updatePosition(definition: AvatarDrawDefinition) {
    if (this.container == null) return;

    this.container.x = this.x + definition.offsetX;
    this.container.y = this.y + definition.offsetY;
    this.container.zIndex = this.zIndex;
  }

  setCurrentFrame(globalFrame: number) {
    this.frame = globalFrame;
    this.updateSprites();
  }

  private updateSprites() {
    if (this.avatarLoaderResult == null) return;

    const { zIndex } = this.options;

    this.container?.destroy();

    this.container = new PIXI.Container();

    const definition = this.avatarLoaderResult.getDrawDefinition(
      this.lookOptions
    );

    this.avatarDrawDefinition = definition;

    this.mirrored = definition.mirrorHorizontal;
    this.updatePosition(definition);

    this.container.scale = new PIXI.Point(
      definition.mirrorHorizontal ? -1 : 1,
      1
    );

    definition.parts.forEach((part) => {
      const asset = this.createAsset(part);
      if (asset == null) return;

      this.container?.addChild(asset);
    });

    this.visualization.addContainerChild(this.container);
  }

  private createAsset(part: AvatarDrawPart) {
    if (this.avatarLoaderResult == null)
      throw new Error(
        "Cant create asset when avatar loader result not present"
      );
    const texture = this.avatarLoaderResult.getTexture(part.fileId);

    if (texture == null) return;

    const sprite = new PIXI.Sprite();
    sprite.texture = texture;

    sprite.x = part.x;
    sprite.y = part.y;

    if (part.color != null && part.mode === "colored") {
      sprite.tint = parseInt(part.color.slice(1), 16);
    }

    return sprite;
  }

  private fetchLook(look: string) {
    this.avatarLoader.getAvatarDrawDefinition(look).then((result) => {
      this.avatarLoaderResult = result;
      this.updateSprites();
    });

    this.updateSprites();
  }

  registered(): void {
    this.fetchLook(this.lookOptions.look);
  }

  destroy(): void {
    this.container?.destroy();
  }
}
