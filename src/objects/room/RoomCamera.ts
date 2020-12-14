import * as PIXI from "pixi.js";

import { Room } from "./Room";

const TWEEN = require("tween.js");

type RoomCameraState =
  | { type: "WAITING" }
  | {
      type: "WAIT_FOR_DISTANCE";
      startX: number;
      startY: number;
      pointerId: number;
    }
  | {
      type: "DRAGGING";
      currentX: number;
      currentY: number;
      pointerId: number;
      startX: number;
      startY: number;
    }
  | {
      type: "ANIMATE_ZERO";
      currentX: number;
      currentY: number;
      startX: number;
      startY: number;
    };

export class RoomCamera extends PIXI.Container {
  private _state: RoomCameraState = { type: "WAITING" };

  private _offsets: { x: number; y: number } = { x: 0, y: 0 };
  private _animatedOffsets: { x: number; y: number } = { x: 0, y: 0 };

  private _container: PIXI.Container;

  constructor(
    private readonly _room: Room,
    private readonly _parent: PIXI.Container,
    private readonly _parentBounds: PIXI.Rectangle,
    private readonly _app: PIXI.Application
  ) {
    super();

    const interactionManager: PIXI.InteractionManager = this._app.renderer
      .plugins.interaction;

    interactionManager.addListener(
      "pointerdown",
      (event: PIXI.InteractionEvent) => {
        this._handlePointerDown(event);
      }
    );

    interactionManager.addListener(
      "pointermove",
      (event: PIXI.InteractionEvent) => {
        this._handlePointerMove(event);
      }
    );

    interactionManager.addListener(
      "pointerup",
      (event: PIXI.InteractionEvent) => {
        this._handlePointerUp(event);
      }
    );

    this._container = new PIXI.Container();
    this._container.addChild(this._room);
    this._parent.addChild(this._container);

    let last: number | undefined;
    this._app.ticker.add(() => {
      if (last == null) last = performance.now();
      const value = performance.now() - last;

      TWEEN.update(value);
      this._updatePosition();
    });
  }

  private _updatePosition() {
    switch (this._state.type) {
      case "DRAGGING":
        const diffX = this._state.currentX - this._state.startX;
        const diffY = this._state.currentY - this._state.startY;

        this._container.x = this._offsets.x + diffX;
        this._container.y = this._offsets.y + diffY;
        break;

      case "ANIMATE_ZERO":
        this._container.x = this._animatedOffsets.x;
        this._container.y = this._animatedOffsets.y;
        break;

      default:
        this._container.x = this._offsets.x;
        this._container.y = this._offsets.y;
    }
  }

  private _isOutOfBounds(offsets: { x: number; y: number }) {
    if (this._room.x + this._room.roomWidth + offsets.x <= 0) {
      return true;
    }

    if (this._room.x + offsets.x >= this._parentBounds.width) {
      return true;
    }

    if (this._room.y + this._room.roomHeight + offsets.y <= 0) {
      return true;
    }

    if (this._room.y + offsets.y >= this._parentBounds.height) {
      return true;
    }

    return false;
  }

  private returnToZero(current: { x: number; y: number }) {
    this._animatedOffsets = current;
    this._offsets = { x: 0, y: 0 };

    const newPos = { ...this._animatedOffsets };

    const tween = new TWEEN.Tween(newPos)
      .to({ x: 0, y: 0 }, 500)
      .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      .onUpdate((value: number) => {
        this._animatedOffsets = newPos;

        if (value >= 1) {
          this._state = { type: "WAITING" };
        }

        this._updatePosition();
      })
      .start();

    this._updatePosition();
  }

  private _handlePointerUp(event: PIXI.InteractionEvent) {
    if (this._state.type === "WAITING" || this._state.type === "ANIMATE_ZERO")
      return;

    if (this._state.pointerId !== event.data.pointerId) return;

    if (this._state.type === "DRAGGING") {
      const diffX = this._state.currentX - this._state.startX;
      const diffY = this._state.currentY - this._state.startY;

      const currentOffsets = {
        x: this._offsets.x + diffX,
        y: this._offsets.y + diffY,
      };

      if (this._isOutOfBounds(currentOffsets)) {
        this._state = {
          ...this._state,
          type: "ANIMATE_ZERO",
        };

        this.returnToZero(currentOffsets);
        return;
      } else {
        this._offsets = currentOffsets;
      }
    }

    this._state = { type: "WAITING" };
    this._updatePosition();
  }

  private _handlePointerDown(event: PIXI.InteractionEvent) {
    if (this._state.type !== "WAITING") return;

    const position = event.data.getLocalPosition(this._parent);

    this._state = {
      type: "WAIT_FOR_DISTANCE",
      pointerId: event.data.pointerId,
      startX: position.x,
      startY: position.y,
    };
  }

  private _handlePointerMove(event: PIXI.InteractionEvent) {
    switch (this._state.type) {
      case "WAIT_FOR_DISTANCE": {
        if (this._state.pointerId !== event.data.pointerId) return;

        const position = event.data.getLocalPosition(this._parent);

        this._state = {
          currentX: position.x,
          currentY: position.y,
          startX: position.x,
          startY: position.y,
          pointerId: this._state.pointerId,
          type: "DRAGGING",
        };
        break;
      }

      case "DRAGGING": {
        if (this._state.pointerId !== event.data.pointerId) return;

        const position = event.data.getLocalPosition(this._parent);

        this._state = {
          ...this._state,
          currentX: position.x,
          currentY: position.y,
        };

        break;
      }
    }
  }
}
