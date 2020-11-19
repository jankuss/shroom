import { IAnimationTicker } from "./interfaces/IAnimationTicker";

const FPS = 24;

export function getFrameCountFromDuration(duration: number) {
  return Math.floor(duration / FPS);
}

export class AnimationTicker implements IAnimationTicker {
  private frame: number = 0;

  private idCounter: number = 0;
  private subscriptions = new Map<number, (frame: number) => void>();

  constructor(application: PIXI.Application) {
    application.ticker.maxFPS = 24;
    application.ticker.minFPS = 24;
    application.ticker.add(() => this.increment());
  }

  static create(application: PIXI.Application) {
    return new AnimationTicker(application);
  }

  private increment() {
    this.frame++;
    this.subscriptions.forEach((cb) => cb(this.frame));
  }

  subscribe(cb: (frame: number) => void): () => void {
    const id = this.idCounter++;

    this.subscriptions.set(id, cb);
    return () => this.subscriptions.delete(id);
  }

  current(): number {
    return this.frame;
  }
}
