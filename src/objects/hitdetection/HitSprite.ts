import * as PIXI from "pixi.js";
import { BehaviorSubject, Observable } from "rxjs";
import { EventEmitter } from "../events/EventEmitter";
import { IEventGroup } from "../events/interfaces/IEventGroup";
import { IEventManager } from "../events/interfaces/IEventManager";
import { IEventManagerEvent } from "../events/interfaces/IEventManagerEvent";
import { IEventTarget } from "../events/interfaces/IEventTarget";
import { Hitmap } from "../furniture/util/loadFurni";
import { Rectangle } from "../room/IRoomRectangle";
import { HitTexture } from "./HitTexture";

export type HitEventHandler = (event: IEventManagerEvent) => void;

export class HitSprite extends PIXI.Sprite implements IEventTarget {
  private _group: IEventGroup;

  private _hitTexture: HitTexture | undefined;
  private _tag: string | undefined;
  private _mirrored: boolean;
  private _ignore = false;
  private _ignoreMouse = false;
  private _eventManager: IEventManager;
  private _rectangleSubject = new BehaviorSubject<Rectangle | undefined>(
    undefined
  );

  private _eventEmitter = new EventEmitter<HitSpriteEventMap>();

  private _getHitmap:
    | (() => (
        x: number,
        y: number,
        transform: { x: number; y: number }
      ) => boolean)
    | undefined;

  public get events() {
    return this._eventEmitter;
  }

  constructor({
    eventManager,
    mirrored = false,
    getHitmap,
    tag,
    group,
  }: {
    eventManager: IEventManager;
    getHitmap?: () => Hitmap;
    mirrored?: boolean;
    tag?: string;
    group: IEventGroup;
  }) {
    super();

    this._group = group;

    this._mirrored = mirrored;
    this._getHitmap = getHitmap;
    this._tag = tag;
    this.mirrored = this._mirrored;
    this._eventManager = eventManager;

    eventManager.register(this);
  }

  getGroup(): IEventGroup {
    return this._group;
  }

  getRectangleObservable(): Observable<Rectangle | undefined> {
    return this._rectangleSubject;
  }

  getEventZOrder(): number {
    return this.zIndex;
  }

  triggerPointerTargetChanged(event: IEventManagerEvent): void {
    event.tag = this._tag;
    this._eventEmitter.trigger("pointertargetchanged", event);
  }

  triggerClick(event: IEventManagerEvent): void {
    event.tag = this._tag;
    this._eventEmitter.trigger("click", event);
  }

  triggerPointerDown(event: IEventManagerEvent): void {
    event.tag = this._tag;
    this._eventEmitter.trigger("pointerdown", event);
  }

  triggerPointerUp(event: IEventManagerEvent): void {
    event.tag = this._tag;
    this._eventEmitter.trigger("pointerup", event);
  }

  triggerPointerOver(event: IEventManagerEvent): void {
    event.tag = this._tag;
    this._eventEmitter.trigger("pointerover", event);
  }

  triggerPointerOut(event: IEventManagerEvent): void {
    event.tag = this._tag;
    this._eventEmitter.trigger("pointerout", event);
  }

  createDebugSprite(): PIXI.Sprite | undefined {
    if (this._hitTexture == null) return;

    const hitMap = this._hitTexture.getHitMap();
    if (hitMap == null) return;

    const sprite = new PIXI.TilingSprite(
      PIXI.Texture.WHITE,
      this._hitTexture.texture.width,
      this._hitTexture.texture.height
    );

    sprite.alpha = 0.1;

    sprite.x = this.getGlobalPosition().x;
    sprite.y = this.getGlobalPosition().y;

    return sprite;
  }

  public get ignoreMouse() {
    return this._ignoreMouse;
  }

  public set ignoreMouse(value) {
    this._ignoreMouse = value;
  }

  public get group() {
    return this._group;
  }

  public get ignore() {
    return this._ignore;
  }

  public set ignore(value) {
    this._ignore = value;
  }

  public get mirrored() {
    return this._mirrored;
  }

  public set mirrored(value) {
    this._mirrored = value;
    this.scale.x = this._mirrored ? -1 : 1;
  }

  public get hitTexture() {
    return this._hitTexture;
  }

  public set hitTexture(value) {
    if (value != null) {
      this.texture = value.texture;
      this._hitTexture = value;
      this._getHitmap = () => (
        x: number,
        y: number,
        transform: { x: number; y: number }
      ) =>
        value.hits(x, y, transform, {
          mirrorHorizonally: this._mirrored,
        });
    }
  }

  getHitDetectionZIndex(): number {
    return this.zIndex;
  }

  destroy() {
    super.destroy();

    this._eventManager.remove(this);
  }

  getHitBox(): Rectangle {
    const pos = this.getGlobalPosition();

    if (this._mirrored) {
      return {
        x: pos.x - this.texture.width,
        y: pos.y,
        width: this.texture.width,
        height: this.texture.height,
      };
    }

    return {
      x: pos.x,
      y: pos.y,
      width: this.texture.width,
      height: this.texture.height,
    };
  }

  hits(x: number, y: number): boolean {
    if (this._getHitmap == null) return false;
    if (this.ignore) return false;
    if (this.ignoreMouse) return false;

    const hitBox = this.getHitBox();

    const inBoundsX = hitBox.x <= x && x <= hitBox.x + hitBox.width;
    const inBoundsY = hitBox.y <= y && y <= hitBox.y + hitBox.height;

    if (inBoundsX && inBoundsY) {
      const hits = this._getHitmap();
      return hits(x, y, {
        x: this.getGlobalPosition().x,
        y: this.getGlobalPosition().y,
      });
    }

    return false;
  }

  updateTransform() {
    super.updateTransform();

    this._rectangleSubject.next(this.getHitBox());
  }
}

export type HitSpriteEventMap = {
  click: IEventManagerEvent;
  pointerup: IEventManagerEvent;
  pointerdown: IEventManagerEvent;
  pointerover: IEventManagerEvent;
  pointerout: IEventManagerEvent;
  pointertargetchanged: IEventManagerEvent;
};
