export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export type HitEventType = "click";

export interface HitEvent {
  mouseEvent: MouseEvent;
  tag?: string;

  stopPropagation(): void;
  absorb(): void;
}

export interface HitDetectionElement {
  trigger(type: HitEventType, event: HitEvent): void;
  hits(x: number, y: number): boolean;
  getHitDetectionZIndex(): number;
}

export interface HitDetectionNode {
  remove(): void;
}

export interface IHitDetection {
  register(rectangle: HitDetectionElement): HitDetectionNode;
}
