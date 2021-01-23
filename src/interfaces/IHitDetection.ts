export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export type HitEventType = "click" | "pointerdown" | "pointerup";

export interface HitEvent {
  mouseEvent: MouseEvent;
  tag?: string;
  target: HitDetectionElement;

  stopPropagation(): void;
  resumePropagation(): void;
}

export interface HitDetectionElement {
  trigger(type: HitEventType, event: HitEvent): void;
  hits(x: number, y: number): boolean;
  getHitDetectionZIndex(): number;
  group?: unknown;
}

export interface HitDetectionNode {
  remove(): void;
}

export interface IHitDetection {
  register(rectangle: HitDetectionElement): HitDetectionNode;
}
