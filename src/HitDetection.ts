import {
  HitDetectionElement,
  HitDetectionNode,
  HitEvent,
  IHitDetection,
} from "./interfaces/IHitDetection";

export class HitDetection implements IHitDetection {
  private counter: number = 0;
  private map: Map<number, HitDetectionElement> = new Map();

  constructor(private app: PIXI.Application) {
    this.app.view.addEventListener("click", (event) => this.handleClick(event));
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
    invoke: (element: HitDetectionElement, event: HitEvent) => void
  ) {
    const elements = this.performHitTest(x, y);
    let stopped = false;

    const event: HitEvent = {
      stopPropagation: () => {
        stopped = true;
      },
    };

    for (let i = 0; i < elements.length; i++) {
      if (stopped) break;
      const element = elements[i];

      invoke(element, event);
    }
  }

  private handleClick(event: MouseEvent) {
    this.triggerEvent(event.clientX, event.clientY, (element, event) =>
      element.trigger("click", event)
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
