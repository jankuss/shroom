import { IAnimationTicker } from "../../interfaces/IAnimationTicker";

const ANIM_FPS = 24;
const TARGET_FPS = 60;

export class AnimationTicker implements IAnimationTicker {
  private _frame = 0;

  private _idCounter = 0;
  private _subscriptions = new Map<
    number,
    (frame: number, accurateFrame: number) => void
  >();

  constructor(application: PIXI.Application) {
    application.ticker.maxFPS = TARGET_FPS;
    application.ticker.minFPS = ANIM_FPS;
    application.ticker.add(() => this._increment());
  }

  static create(application: PIXI.Application) {
    return new AnimationTicker(application);
  }

  subscribe(cb: (frame: number, accurateFrame: number) => void): () => void {
    const id = this._idCounter++;

    this._subscriptions.set(id, cb);
    return () => this._subscriptions.delete(id);
  }

  current(): number {
    return this._getNormalizedFrame(this._frame).rounded;
  }

  private _getNormalizedFrame(frame: number) {
    const factor = ANIM_FPS / TARGET_FPS;
    const calculatedFrame = frame * factor;

    return { rounded: Math.floor(calculatedFrame), pure: calculatedFrame };
  }

  private _increment() {
    this._frame += 1;
    const data = this._getNormalizedFrame(this._frame);

    this._subscriptions.forEach((cb) => cb(data.rounded, data.pure));
  }
}
