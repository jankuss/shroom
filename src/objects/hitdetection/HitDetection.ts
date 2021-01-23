import * as PIXI from "pixi.js";
import {
  HitDetectionElement,
  HitDetectionNode,
  HitEvent,
  HitEventType,
  IHitDetection,
} from "../../interfaces/IHitDetection";

export class HitDetection implements IHitDetection {
  private _counter = 0;
  private _map: Map<number, HitDetectionElement> = new Map();
  private _container: PIXI.Container | undefined;

  constructor(private _app: PIXI.Application) {
    _app.view.addEventListener("click", (event) => this.handleClick(event), {
      capture: true,
    });

    _app.view.addEventListener("pointerdown", (event) =>
      this.handlePointerDown(event)
    );

    _app.view.addEventListener("pointerup", (event) =>
      this.handlePointerUp(event)
    );

    _app.view.addEventListener(
      "contextmenu",
      (event) => this.handleClick(event),
      {
        capture: true,
      }
    );
  }

  static create(application: PIXI.Application) {
    return new HitDetection(application);
  }

  register(rectangle: HitDetectionElement): HitDetectionNode {
    const id = this._counter++;
    this._map.set(id, rectangle);

    return {
      remove: () => {
        this._map.delete(id);
      },
    };
  }

  handleClick(event: MouseEvent) {
    this._triggerEvent(event.clientX, event.clientY, "click", event);
  }

  handlePointerDown(event: PointerEvent) {
    this._triggerEvent(event.clientX, event.clientY, "pointerdown", event);
  }

  handlePointerUp(event: PointerEvent) {
    this._triggerEvent(event.clientX, event.clientY, "pointerup", event);
  }

  private _triggerEvent(
    x: number,
    y: number,
    eventType: HitEventType,
    domEvent: MouseEvent
  ) {
    const elements = this._performHitTest(x, y);

    const event = new HitEventPropagation(eventType, domEvent, elements);
    event.resumePropagation();
  }

  private _performHitTest(x: number, y: number) {
    const rect = this._app.view.getBoundingClientRect();

    x = x - rect.x;
    y = y - rect.y;

    const entries = Array.from(this._map.values());
    const ordered = entries.sort(
      (a, b) => b.getHitDetectionZIndex() - a.getHitDetectionZIndex()
    );

    return ordered.filter((element) => {
      return element.hits(x, y);
    });
  }
}

class HitEventPropagation {
  private _currentIndex = 0;
  private _stopped = false;
  private _groups: Set<unknown> = new Set();

  constructor(
    private _eventType: HitEventType,
    private _mouseEvent: MouseEvent,
    private _path: HitDetectionElement[]
  ) {}

  public get mouseEvent() {
    return this._mouseEvent;
  }

  stopPropagation(): void {
    this._stopped = true;
  }

  resumePropagation(): void {
    this._stopped = false;
    this._propagateEvent();
  }

  private _propagateEvent() {
    for (let i = this._currentIndex; i < this._path.length; i++) {
      this._currentIndex = i + 1;

      if (this._stopped) break;

      const element = this._path[i];

      const group = element.group;
      if (group == null || !this._groups.has(group)) {
        element.trigger(this._eventType, new TargetedHitEvent(this, element));

        if (group != null) {
          this._groups.add(group);
        }
      }
    }
  }
}

class TargetedHitEvent implements HitEvent {
  private _tag: string | undefined;

  constructor(
    private _base: HitEventPropagation,
    private _target: HitDetectionElement
  ) {}

  public get target() {
    return this._target;
  }

  public get mouseEvent() {
    return this._base.mouseEvent;
  }

  public get tag() {
    return this._tag;
  }

  public set tag(value) {
    this._tag = value;
  }

  stopPropagation(): void {
    return this._base.stopPropagation();
  }

  resumePropagation(): void {
    return this._base.resumePropagation();
  }
}
