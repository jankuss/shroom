import { EventManagerNode } from "./EventManagerNode";
import { IEventManagerNode } from "./interfaces/IEventManagerNode";
import { IEventTarget } from "./interfaces/IEventTarget";
import RBush from "rbush";
import { IEventManagerEvent } from "./interfaces/IEventManagerEvent";
import { EventGroupIdentifier } from "./interfaces/IEventGroup";
import { IEventManager } from "./interfaces/IEventManager";

export class EventManager {
  private _nodes = new Map<IEventTarget, EventManagerNode>();
  private _bush = new RBush<EventManagerNode>();
  private _currentOverElements: Set<EventManagerNode> = new Set();

  click(x: number, y: number) {
    const elements = this._performHitTest(x, y);
    new Propagation(elements.activeNodes, (target, event) =>
      target.triggerClick(event)
    );
  }

  pointerDown(x: number, y: number) {
    const elements = this._performHitTest(x, y);

    new Propagation(elements.activeNodes, (target, event) =>
      target.triggerPointerDown(event)
    );
  }

  pointerUp(x: number, y: number) {
    const elements = this._performHitTest(x, y);

    new Propagation(elements.activeNodes, (target, event) =>
      target.triggerPointerUp(event)
    );
  }

  move(x: number, y: number) {
    const elements = this._performHitTest(x, y);
    const current = new Set(elements.activeNodes);
    const previous = this._currentOverElements;

    const added = new Set<EventManagerNode>();
    current.forEach((node) => {
      if (!previous.has(node)) {
        added.add(node);
      }
    });

    const removed = new Set<EventManagerNode>();
    previous.forEach((node) => {
      if (!current.has(node)) {
        removed.add(node);
      }
    });

    this._currentOverElements = current;

    new Propagation(Array.from(added), (target, event) =>
      target.triggerPointerOver(event)
    );
    new Propagation(Array.from(removed), (target, event) =>
      target.triggerPointerOut(event)
    );
  }

  register(target: IEventTarget): IEventManagerNode {
    if (this._nodes.has(target)) throw new Error("Target already registered");

    const node = new EventManagerNode(target, this._bush);
    this._nodes.set(target, node);

    return node;
  }

  remove(target: IEventTarget) {
    const current = this._nodes.get(target);
    if (current == null) throw new Error("Target isn't in the event manager");

    current.destroy();
  }

  private _performHitTest(x: number, y: number) {
    const qualifyingElements = this._bush.search({
      minX: x,
      minY: y,
      maxX: x,
      maxY: y,
    });

    const sortedElements = qualifyingElements
      .sort((a, b) => b.target.getEventZOrder() - a.target.getEventZOrder())
      .filter((node) => node.target.hits(x, y));

    const groups = new Map<unknown, EventManagerNode>();
    const groupElements: EventManagerNode[] = [];

    sortedElements.forEach((node) => {
      const group = node.target.getGroup();
      if (group != null && groups.has(group)) return;

      groupElements.push(node);

      if (group != null) {
        groups.set(group, node);
      }
    });

    return {
      activeNodes: groupElements,
      activeGroups: groups,
    };
  }
}

class Propagation {
  private _skip = new Set<EventGroupIdentifier>();
  private _stopped = false;

  constructor(
    private path: EventManagerNode[],
    private _trigger: (target: IEventTarget, event: IEventManagerEvent) => void
  ) {
    this._propagate();
  }

  private _propagate() {
    const event = this._createEvent();
    for (let i = 0; i < this.path.length; i++) {
      if (this._stopped) return;
      const node = this.path[i];

      if (this._skip.has(node.target.getGroup().getEventGroupIdentifier()))
        continue;

      this._trigger(this.path[i].target, event);
    }
  }

  private _createEvent(): IEventManagerEvent {
    return {
      stopPropagation: () => {
        this._stopped = true;
      },
      skip: (identifiers) => {
        identifiers.forEach((identifier) => {
          this._skip.add(identifier);
        });
      },
    };
  }
}

export const NOOP_EVENT_MANAGER: IEventManager = {
  register: (): IEventManagerNode => {
    return {
      destroy: () => {
        // Do nothing
      },
    };
  },
  remove: () => {
    // Do nothing
  },
};
