import * as PIXI from "pixi.js";
import {
  BounceOptions,
  ClampOptions,
  ClampZoomOptions,
  DecelerateOptions,
  DragOptions,
  FollowOptions,
  MouseEdgesOptions,
  MovedEventData,
  PinchOptions,
  SnapOptions,
  SnapZoomOptions,
  Viewport,
  WheelOptions,
} from "pixi-viewport";
import { Room } from "./Room";

export class RoomCamera extends PIXI.Container {
  public readonly viewport: Viewport;
  private readonly room: Room;

  // Plugin functions

  public readonly snapZoom: Viewport["snapZoom"];
  public readonly clamp: Viewport["clamp"];
  public readonly decelerate: Viewport["decelerate"];
  public readonly bounce: Viewport["bounce"];
  public readonly pinch: Viewport["pinch"];
  public readonly snap: Viewport["snap"];
  public readonly follow: Viewport["follow"];
  public readonly wheel: Viewport["wheel"];
  public readonly clampZoom: Viewport["clampZoom"];
  public readonly mouseEdges: Viewport["mouseEdges"];

  constructor(
    public readonly _room: Room,
    private readonly dragOptions?: DragOptions
  ) {
    super();

    this.room = _room;

    this.viewport = new Viewport({
      worldHeight: this.room.roomHeight,
      worldWidth: this.room.roomWidth,
      interaction: this.room.application.renderer.plugins.interaction,
      ticker: this.room.application.ticker,
    });

    // Set viewport plugins

    this.snapZoom = (options?: SnapZoomOptions) =>
      this.viewport.snapZoom(options);
    this.clamp = (options?: ClampOptions) => this.viewport.clamp(options);
    this.decelerate = (options?: DecelerateOptions) =>
      this.viewport.decelerate(options);
    this.bounce = (options?: BounceOptions) => this.viewport.bounce(options);
    this.pinch = (options?: PinchOptions) => this.viewport.pinch(options);
    this.snap = (x: number, y: number, options?: SnapOptions) =>
      this.viewport.snap(x, y, options);
    this.follow = (target: PIXI.DisplayObject, options?: FollowOptions) =>
      this.viewport.follow(target, options);
    this.wheel = (options?: WheelOptions) => this.viewport.wheel(options);
    this.clampZoom = (options?: ClampZoomOptions) =>
      this.viewport.clampZoom(options);
    this.mouseEdges = (options?: MouseEdgesOptions) =>
      this.viewport.mouseEdges(options);

    this.viewport.drag({ ...dragOptions, wheel: false });

    this.viewport.addChild(this.room);
    this.addChild(this.viewport);

    this.viewportEvents();
  }

  viewportEvents(): void {
    // @ts-ignore
    this.viewport.on("drag-end", this.dragEnd);
    this.viewport.on("snap-end", () => this.viewport.plugins.remove("snap"));
  }

  dragEnd = (container: MovedEventData): void => {
    if (
      this.room.height - this.room.wallHeight - this.room.tileHeight <
        container.viewport.top ||
      container.viewport.worldWidth < container.viewport.left ||
      container.viewport.bottom + this.room.wallHeight < 0 ||
      container.viewport.right + this.room.wallDepth < 0
    ) {
      this.viewport.snap(
        (this.room.application.screen.width + this.room.roomWidth) / 8,
        (this.room.application.screen.height -
          this.room.roomHeight -
          this.room.tileHeight -
          this.room.wallHeight) /
          8
      );
    }
  };
}
