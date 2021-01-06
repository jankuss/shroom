import * as PIXI from "pixi.js";
import {
  HitDetectionElement,
  HitDetectionNode,
  HitEvent,
  IHitDetection,
} from "../../interfaces/IHitDetection";

export class HitDetection implements IHitDetection {
  private counter: number = 0;
  private map: Map<number, HitDetectionElement> = new Map();
  private container: PIXI.Container | undefined;

  constructor(private app: PIXI.Application) {
    app.view.addEventListener("click", (event) => this.handleClick(event), {
      capture: true,
    });

    app.view.addEventListener(
      "contextmenu",
      (event) => this.handleClick(event),
      {
        capture: true,
      }
    );
  }

  private _debugHitDetection() {
    this.container?.destroy();
    this.container = new PIXI.Container();

    this.map.forEach((value) => {
      const box = value.getHitBox();
      const graphics = new PIXI.Graphics();

      graphics.x = box.x;
      graphics.y = box.y;
      graphics.beginFill(0x000000, 0.1);
      graphics.drawRect(0, 0, box.width, box.height);
      graphics.endFill();

      this.container?.addChild(graphics);
    });

    this.app.stage.addChild(this.container);
  }

  static create(application: PIXI.Application) {
    return new HitDetection(application);
  }

  register(rectangle: HitDetectionElement): HitDetectionNode {
    const id = this.counter++;
    this.map.set(id, rectangle);

    return {
      remove: () => {
        this.map.delete(id);
      },
    };
  }

  private triggerEvent(
    x: number,
    y: number,
    invoke: (element: HitDetectionElement, event: HitEvent) => void,
    domEvent: MouseEvent
  ) {
    const elements = this.performHitTest(x, y);
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

  public handleClick(event: MouseEvent) {
    this.triggerEvent(
      event.clientX,
      event.clientY,
      (element, event) => element.trigger("click", event),
      event
    );
  }

  private performHitTest(x: number, y: number) {
    const rect = this.app.view.getBoundingClientRect();

    x = x - rect.x;
    y = y - rect.y;

    const entries = Array.from(this.map.values()).map((element) => ({
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
