import * as PIXI from "pixi.js";

import { Room } from "./Room";

const TWEEN = require("tween.js");

export class RoomCamera extends PIXI.Container {
  private _state: RoomCameraState = { type: "WAITING" };

  private _offsets: { x: number; y: number } = { x: 0, y: 0 };
  private _animatedOffsets: { x: number; y: number } = { x: 0, y: 0 };

  private _container: PIXI.Container;
  private _tween: any;

  private _interactionManager: PIXI.InteractionManager;

  static forScreen(room: Room, options?: RoomCameraOptions) {
    return new RoomCamera(room, () => room.application.screen, options);
  }

  constructor(
    private readonly _room: Room,
    private readonly _parentBounds: () => PIXI.Rectangle,
    private readonly _options?: RoomCameraOptions
  ) {
    super();

    this._interactionManager = this._room.application.renderer.plugins.interaction;

    this._interactionManager.addListener(
      "pointerdown",
      this._handlePointerDown
    );
    this._interactionManager.addListener(
      "pointermove",
      this._handlePointerMove
    );
    this._interactionManager.addListener("pointerup", this._handlePointerUp);

    // These events (cancel, out, leave) are semantically equal to lifting the pointer up.
    // We just use the pointerup event handler here.

    this._interactionManager.addListener(
      "pointercancel",
      this._handlePointerUp
    );
    this._interactionManager.addListener("pointerout", this._handlePointerUp);
    this._interactionManager.addListener("pointerleave", this._handlePointerUp);

    this._container = new PIXI.Container();
    this._container.addChild(this._room);
    this.addChild(this._container);

    let last: number | undefined;
    this._room.application.ticker.add(() => {
      if (last == null) last = performance.now();
      const value = performance.now() - last;

      TWEEN.update(value);
    });
  }

  private _handlePointerUp = (event: PIXI.InteractionEvent) => {
    if (this._state.type === "WAITING" || this._state.type === "ANIMATE_ZERO")
      return;

    if (this._state.pointerId !== event.data.pointerId) return;

    let animatingBack = false;

    if (this._state.type === "DRAGGING") {
      animatingBack = this._stopDragging(this._state);
    }

    if (!animatingBack) {
      this._resetDrag();
    }
  };

  private _handlePointerDown = (event: PIXI.InteractionEvent) => {
    const position = event.data.getLocalPosition(this.parent);
    if (this._state.type === "WAITING") {
      this._enterWaitingForDistance(position, event.data.pointerId);
    } else if (this._state.type === "ANIMATE_ZERO") {
      this._changingDragWhileAnimating(position, event.data.pointerId);
    }
  };

  private _handlePointerMove = (event: PIXI.InteractionEvent) => {
    const position = event.data.getLocalPosition(this.parent);

    switch (this._state.type) {
      case "WAIT_FOR_DISTANCE": {
        this._tryUpgradeWaitForDistance(
          this._state,
          position,
          event.data.pointerId
        );
        break;
      }

      case "DRAGGING": {
        this._updateDragging(this._state, position, event.data.pointerId);
        break;
      }
    }
  };

  private _updatePosition() {
    switch (this._state.type) {
      case "DRAGGING":
        // When dragging, the current position consists of the current offset of the camera
        // and the drag difference.

        const diffX = this._state.currentX - this._state.startX;
        const diffY = this._state.currentY - this._state.startY;

        this._container.x = this._offsets.x + diffX;
        this._container.y = this._offsets.y + diffY;
        break;

      case "ANIMATE_ZERO":
        // When animating back to the zero point, we use the animatedOffsets of the camera.

        this._container.x = this._animatedOffsets.x;
        this._container.y = this._animatedOffsets.y;
        break;

      default:
        // Default behavior: Use the set offsets of the camera.

        this._container.x = this._offsets.x;
        this._container.y = this._offsets.y;
    }
  }

  private _isOutOfBounds(offsets: { x: number; y: number }) {
    const roomX = this.parent.transform.position.x + this._room.x;
    const roomY = this.parent.transform.position.y + this._room.y;

    if (roomX + this._room.roomWidth + offsets.x <= 0) {
      // The room is out of bounds to the left side.
      return true;
    }

    if (roomX + offsets.x >= this._parentBounds().width) {
      // The room is out of bounds to the right side.
      return true;
    }

    if (roomY + this._room.roomHeight + offsets.y <= 0) {
      // The room is out of bounds to the top side.
      return true;
    }

    if (roomY + offsets.y >= this._parentBounds().height) {
      // The room is out of bounds to the botoom side.
      return true;
    }

    return false;
  }

  private _returnToZero(
    state: CameraDraggingState,
    current: { x: number; y: number }
  ) {
    this._state = {
      ...state,
      type: "ANIMATE_ZERO",
    };
    const duration = this._options?.duration ?? 500;

    this._animatedOffsets = current;
    this._offsets = { x: 0, y: 0 };

    const newPos = { ...this._animatedOffsets };

    const tween = new TWEEN.Tween(newPos)
      .to({ x: 0, y: 0 }, duration)
      .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      .onUpdate((value: number) => {
        this._animatedOffsets = newPos;

        if (value >= 1) {
          this._state = { type: "WAITING" };
        }

        this._updatePosition();
      })
      .start();

    this._tween = tween;

    this._updatePosition();
  }

  private _stopDragging(state: CameraDraggingState) {
    const diffX = state.currentX - state.startX;
    const diffY = state.currentY - state.startY;

    const currentOffsets = {
      x: this._offsets.x + diffX,
      y: this._offsets.y + diffY,
    };

    if (
      this._isOutOfBounds(currentOffsets) ||
      (state.skipBoundsCheck != null && state.skipBoundsCheck)
    ) {
      this._returnToZero(state, currentOffsets);
      return true;
    } else {
      this._offsets = currentOffsets;
    }

    return false;
  }

  private _resetDrag() {
    this._state = { type: "WAITING" };
    this._updatePosition();
  }

  private _changingDragWhileAnimating(position: PIXI.Point, pointerId: number) {
    this._offsets = this._animatedOffsets;
    this._animatedOffsets = { x: 0, y: 0 };
    this._tween.stop();

    this._state = {
      currentX: position.x,
      currentY: position.y,
      startX: position.x,
      startY: position.y,
      pointerId: pointerId,
      type: "DRAGGING",
      skipBoundsCheck: true,
    };

    this._updatePosition();
  }

  private _enterWaitingForDistance(position: PIXI.Point, pointerId: number) {
    this._state = {
      type: "WAIT_FOR_DISTANCE",
      pointerId: pointerId,
      startX: position.x,
      startY: position.y,
    };
  }

  private _tryUpgradeWaitForDistance(
    state: CameraWaitForDistanceState,
    position: PIXI.Point,
    pointerId: number
  ) {
    if (state.pointerId !== pointerId) return;

    const distance = Math.sqrt(
      (position.x - state.startX) ** 2 + (position.y - state.startY) ** 2
    );

    // When the distance of the pointer travelled more than 10px, start dragging.
    if (distance >= 10) {
      this._state = {
        currentX: position.x,
        currentY: position.y,
        startX: position.x,
        startY: position.y,
        pointerId: pointerId,
        type: "DRAGGING",
      };
      this._updatePosition();
    }
  }

  private _updateDragging(
    state: CameraDraggingState,
    position: PIXI.Point,
    pointerId: number
  ) {
    if (state.pointerId !== pointerId) return;

    this._state = {
      ...state,
      currentX: position.x,
      currentY: position.y,
    };

    this._updatePosition();
  }
  destroy() {
    this._interactionManager.removeListener(
      "pointerdown",
      this._handlePointerDown
    );
    this._interactionManager.removeListener(
      "pointermove",
      this._handlePointerMove
    );
    this._interactionManager.removeListener("pointerup", this._handlePointerUp);

    // These events (cancel, out, leave) are semantically equal to lifting the pointer up.
    // We just use the pointerup event handler here.

    this._interactionManager.removeListener(
      "pointercancel",
      this._handlePointerUp
    );
    this._interactionManager.removeListener(
      "pointerout",
      this._handlePointerUp
    );
    this._interactionManager.removeListener(
      "pointerleave",
      this._handlePointerUp
    );
  }
}

type CameraDraggingState = {
  type: "DRAGGING";
  currentX: number;
  currentY: number;
  pointerId: number;
  startX: number;
  startY: number;
  skipBoundsCheck?: boolean;
};

type CameraAnimateZeroState = {
  type: "ANIMATE_ZERO";
  currentX: number;
  currentY: number;
  startX: number;
  startY: number;
};

type CameraWaitForDistanceState = {
  type: "WAIT_FOR_DISTANCE";
  startX: number;
  startY: number;
  pointerId: number;
};

type RoomCameraState =
  | { type: "WAITING" }
  | CameraWaitForDistanceState
  | CameraDraggingState
  | CameraAnimateZeroState;

type RoomCameraOptions = { duration?: number };
