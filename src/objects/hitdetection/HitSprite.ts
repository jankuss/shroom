import * as PIXI from "pixi.js";
import {
  HitDetectionElement,
  HitDetectionNode,
  HitEvent,
  HitEventType,
  IHitDetection,
  Rect,
} from "../../interfaces/IHitDetection";
import { Hitmap } from "../furniture/util/loadFurni";
import { HitTexture } from "./HitTexture";

export type HitEventHandler = (event: HitEvent) => void;

export class HitSprite extends PIXI.Sprite implements HitDetectionElement {
  private _hitDetectionNode: HitDetectionNode | undefined;
  private _handlers = new Map<HitEventType, Set<HitEventHandler>>();
  private _hitTexture: HitTexture | undefined;
  private _tag: string | undefined;
  private _mirrored: boolean;
  private _mirrorNotVisually: boolean;

  public get mirrored() {
    return this._mirrored;
  }

  public set mirrored(value) {
    this._mirrored = value;
    this.scale.x = this._mirrored ? -1 : 1;
  }

  private _getHitmap:
    | (() => (
        x: number,
        y: number,
        transform: { x: number; y: number }
      ) => boolean)
    | undefined;

  public get hitTexture() {
    return this._hitTexture;
  }

  public set hitTexture(value) {
    if (value != null) {
      this.texture = value.texture;
      this._getHitmap = () => (
        x: number,
        y: number,
        transform: { x: number; y: number }
      ) =>
        value.hits(x, y, transform, {
          mirrorHorizonally: this._mirrored || this._mirrorNotVisually,
        });
    }
  }

  constructor({
    hitDetection,
    mirrored = false,
    mirroredNotVisually = false,
    getHitmap,
    tag,
  }: {
    hitDetection: IHitDetection;
    getHitmap?: () => Hitmap;
    mirrored?: boolean;
    mirroredNotVisually?: boolean;
    tag?: string;
  }) {
    super();

    this._mirrored = mirrored;
    this._mirrorNotVisually = mirroredNotVisually;
    this._getHitmap = getHitmap;
    this._tag = tag;
    this._hitDetectionNode = hitDetection.register(this);
    this.mirrored = this._mirrored;
  }

  trigger(type: HitEventType, event: HitEvent): void {
    const handlers = this._handlers.get(type);

    handlers?.forEach((handler) => handler({ ...event, tag: this._tag }));
  }

  addEventListener(type: HitEventType, handler: HitEventHandler) {
    const existingHandlers = this._handlers.get(type) ?? new Set();
    existingHandlers.add(handler);

    this._handlers.set(type, existingHandlers);
  }

  removeEventListener(type: HitEventType, handler: HitEventHandler) {
    const existingHandlers = this._handlers.get(type);
    existingHandlers?.delete(handler);
  }

  destroy() {
    super.destroy();

    this._hitDetectionNode?.remove();
  }

  getHitBox(): Rect {
    if (this._mirrored || this._mirrorNotVisually) {
      return {
        x: this.worldTransform.tx - this.texture.width,
        y: this.worldTransform.ty,
        width: this.texture.width,
        height: this.texture.height,
        zIndex: this.zIndex,
      };
    }

    return {
      x: this.worldTransform.tx,
      y: this.worldTransform.ty,
      width: this.texture.width,
      height: this.texture.height,
      zIndex: this.zIndex,
    };
  }

  hits(x: number, y: number): boolean {
    if (this._getHitmap == null) return false;

    const hits = this._getHitmap();

    return hits(x, y, { x: this.worldTransform.tx, y: this.worldTransform.ty });
  }
}
