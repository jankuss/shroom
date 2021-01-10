import * as PIXI from "pixi.js";
import {
  HitDetectionElement,
  HitDetectionNode,
  HitEvent,
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
    this._triggerEvent(
      event.clientX,
      event.clientY,
      (element, event) => element.trigger("click", event),
      event
    );
  }

  private _debugHitDetection() {
    this._container?.destroy();
    this._container = new PIXI.Container();

    this._map.forEach((value) => {
      const box = value.getHitBox();
      const graphics = new PIXI.Graphics();

      graphics.x = box.x;
      graphics.y = box.y;
      graphics.beginFill(0x000000, 0.1);
      graphics.drawRect(0, 0, box.width, box.height);
      graphics.endFill();

      this._container?.addChild(graphics);
    });

    this._app.stage.addChild(this._container);
  }

  private _triggerEvent(
    x: number,
    y: number,
    invoke: (element: HitDetectionElement, event: HitEvent) => void,
    domEvent: MouseEvent
  ) {
    const elements = this._performHitTest(x, y);
    let stopped = false;

    const event: HitEvent = {
      stopPropagation: () => {
        stopped = true;
      },
      absorb: () => {
        domEvent?.stopImmediatePropagation();
      },
      mouseEvent: domEvent,
    };

    for (let i = 0; i < elements.length; i++) {
      if (stopped) break;
      const element = elements[i];

      invoke(element, event);
    }
  }

  private _performHitTest(x: number, y: number) {
    const rect = this._app.view.getBoundingClientRect();

    x = x - rect.x;
    y = y - rect.y;

    const entries = Array.from(this._map.values()).map((element) => ({
      hitBox: element.getHitBox(),
      element,
    }));

    const ordered = entries.sort((a, b) => b.hitBox.zIndex - a.hitBox.zIndex);

    const hit = ordered.filter(({ element, hitBox }) => {
      const inBoundsX = hitBox.x <= x && x <= hitBox.x + hitBox.width;
      const inBoundsY = hitBox.y <= y && y <= hitBox.y + hitBox.height;

      const inBounds = inBoundsX && inBoundsY;

      if (inBounds) {
        return element.hits(x, y);
      } else {
        return false;
      }
    });

    return hit.map(({ element }) => element);
  }
}
