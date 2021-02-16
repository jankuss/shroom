import { InteractionEvent } from "pixi.js";
import { Rectangle } from "../objects/room/IRoomRectangle";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export type HitEventType = "click" | "pointerdown" | "pointerup";

export interface HitEvent {
  mouseEvent: MouseEvent | TouchEvent | PointerEvent;
  interactionEvent: InteractionEvent;

  tag?: string;
  target: HitDetectionElement;

  stopPropagation(): void;
  resumePropagation(): void;
}

export interface HitDetectionElement {
  group?: unknown;

  trigger(type: HitEventType, event: HitEvent): void;
  hits(x: number, y: number): boolean;
  getHitDetectionZIndex(): number;
  createDebugSprite?(): PIXI.Sprite | undefined;
}

export interface HitDetectionNode {
  remove(): void;
  updateDimensions(element: Rectangle | undefined): void;
}

export interface IHitDetection {
  register(rectangle: HitDetectionElement): HitDetectionNode;
}
