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

  private _triggerEvent(
    x: number,
    y: number,
    eventType: HitEventType,
    domEvent: MouseEvent
  ) {
    const elements = this._performHitTest(x, y);

    const event = new HitEventImplementation(eventType, domEvent, elements);
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

class HitEventImplementation implements HitEvent {
  private _currentIndex = 0;
  private _stopped = false;
  private _tag: string | undefined;

  constructor(
    private _eventType: HitEventType,
    private _mouseEvent: MouseEvent,
    private _path: HitDetectionElement[]
  ) {}

  public get mouseEvent() {
    return this._mouseEvent;
  }

  public get tag() {
    return this._tag;
  }

  public set tag(value) {
    this._tag = value;
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
      element.trigger(this._eventType, this);
    }
  }
}
