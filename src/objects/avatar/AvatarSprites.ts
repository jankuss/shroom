import { RoomObject } from "../../RoomObject";
import * as PIXI from "pixi.js";
import { AvatarLoaderResult } from "../../IAvatarLoader";
import {
  AvatarDrawDefinition,
  AvatarDrawPart,
  PrimaryAction,
} from "./util/getAvatarDrawDefinition";
import { getZOrder } from "../../util/getZOrder";
import { avatarFrames } from "./util/avatarFrames";
import { LookOptions } from "./util/createLookServer";
import { DrawDefinition } from "../furniture/util";

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

  private lookOptions: LookOptions;

  private _x: number = 0;
  private _y: number = 0;

  get x() {
    return this._x;
  }

  set x(value) {
    this._x = value;
  }

  get y() {
    return this._y;
  }

  set y(value) {
    this._y = value;
  }

  constructor(private options: Options) {
    super();

    this.x = this.options.position.x;
    this.y = this.options.position.y;
    this.lookOptions = options.look;
  }

  setLook(options: LookOptions) {
    this.lookOptions = options;
    this.updateSprites();
  }

  private updatePosition(definition: AvatarDrawDefinition) {
    if (this.container == null) return;

    this.container.x = this.x + definition.offsetX;
    this.container.y = this.y + definition.offsetY;
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

    this.container.zIndex = zIndex;

    const definition = this.avatarLoaderResult.getDrawDefinition(
      this.lookOptions
    );

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
