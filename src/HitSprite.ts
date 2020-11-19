import * as PIXI from "pixi.js";
import {
  HitDetectionElement,
  HitDetectionNode,
  HitEvent,
  HitEventType,
  IHitDetection,
  Rect,
} from "./interfaces/IHitDetection";

import { Hitmap } from "./objects/furniture/util/loadFurni";

export type HitEventHandler = (event: HitEvent) => void;

export class HitSprite extends PIXI.Sprite implements HitDetectionElement {
  private hitDetectionNode: HitDetectionNode | undefined;

  private _handlers = new Map<HitEventType, Set<HitEventHandler>>();

  constructor(
    private hitDetection: IHitDetection,
    private getHitmap: () => Hitmap,
    private mirrored: boolean,
    private tag?: string
  ) {
    super();

    if (this.mirrored) {
      this.scale = new PIXI.Point(this.mirrored ? -1 : 1, 1);
    }

    this.hitDetectionNode = this.hitDetection.register(this);
  }

  trigger(type: HitEventType, event: HitEvent): void {
    const handlers = this._handlers.get(type);

    handlers?.forEach((handler) => handler({ ...event, tag: this.tag }));
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

    this.hitDetectionNode?.remove();
  }

  getHitBox(): Rect {
    if (this.mirrored) {
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
    const hits = this.getHitmap();

    return hits(x, y, { x: this.worldTransform.tx, y: this.worldTransform.ty });
  }
}
