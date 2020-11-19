import { IAnimationTicker } from "./interfaces/IAnimationTicker";

const ANIM_FPS = 24;
const TARGET_FPS = 60;

export class AnimationTicker implements IAnimationTicker {
  private frame: number = 0;

  private idCounter: number = 0;
  private subscriptions = new Map<
    number,
    (frame: number, accurateFrame: number) => void
  >();

  constructor(application: PIXI.Application) {
    application.ticker.maxFPS = TARGET_FPS;
    application.ticker.minFPS = TARGET_FPS;
    application.ticker.add(() => this.increment());
  }

  static create(application: PIXI.Application) {
    return new AnimationTicker(application);
  }

  private getNormalizedFrame(frame: number) {
    const factor = ANIM_FPS / TARGET_FPS;
    const calculatedFrame = frame * factor;

    return { rounded: Math.floor(calculatedFrame), pure: calculatedFrame };
  }

  private increment() {
    this.frame++;
    const data = this.getNormalizedFrame(this.frame);

    this.subscriptions.forEach((cb) => cb(data.rounded, data.pure));
  }

  subscribe(cb: (frame: number) => void): () => void {
    const id = this.idCounter++;

    this.subscriptions.set(id, cb);
    return () => this.subscriptions.delete(id);
  }

  current(): number {
    return this.getNormalizedFrame(this.frame).rounded;
  }
}
