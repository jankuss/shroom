import * as PIXI from "pixi.js";
import {
  BounceOptions,
  ClampOptions,
  ClampZoomOptions,
  DecelerateOptions,
  DragOptions,
  FollowOptions,
  MouseEdgesOptions,
  PinchOptions,
  SnapOptions,
  SnapZoomOptions,
  Viewport,
  WheelOptions,
} from "pixi-viewport";
import { Room } from "./Room";

export class RoomCamera extends PIXI.Container {
  public readonly viewport: Viewport;

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
    public readonly room: Room,
    private readonly dragOptions?: DragOptions
  ) {
    super();

    // Viewport instantiating

    this.viewport = new Viewport({
      worldHeight: room.roomHeight,
      worldWidth: room.roomWidth,
      interaction: room.application.renderer.plugins.interaction,
      ticker: room.application.ticker,
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

    // Calling drag

    this.viewport.drag(dragOptions);

    // Adding room to viewport

    this.viewport.addChild(room);

    // Adding viewport to container
    this.addChild(this.viewport);
  }
}
