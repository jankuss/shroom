import { IFurnitureVisualizationView } from "../IFurnitureVisualizationView";
import { AnimatedFurnitureVisualization } from "./AnimatedFurnitureVisualization";
import { FurnitureVisualization } from "./FurnitureVisualization";

export class FurnitureBottleVisualization extends FurnitureVisualization {
  private static readonly ANIMATION_ID_OFFSET_SLOW1 = 20;
  private static readonly ANIMATION_ID_OFFSET_SLOW2 = 9;
  private static readonly ANIMATION_ID_ROLL = -1;

  private _base: AnimatedFurnitureVisualization = new AnimatedFurnitureVisualization();

  private _stateQueue: number[] = [];
  private _running = false;

  isAnimated(): boolean {
    return true;
  }

  destroy(): void {
    this._base.destroy();
  }

  update(): void {
    this._base.update();
  }

  setView(view: IFurnitureVisualizationView) {
    super.setView(view);
    this._base.setView(view);
  }

  updateFrame(frame: number): void {
    if (
      this._stateQueue.length > 0 &&
      this._base.isLastFramePlayedForLayer(0)
    ) {
      const nextAnimation = this._stateQueue.shift();
      if (nextAnimation != null) {
        this._base.setCurrentAnimation(nextAnimation);
      }
    }

    this._base.updateFrame(frame);
  }

  updateDirection(direction: number): void {
    this._base.updateDirection(direction);
  }

  updateAnimation(animation: string): void {
    if (
      animation === FurnitureBottleVisualization.ANIMATION_ID_ROLL.toString()
    ) {
      if (!this._running) {
        this._running = true;
        this._stateQueue.push(FurnitureBottleVisualization.ANIMATION_ID_ROLL);
        return;
      }
    }

    const animationNumber = Number(animation);

    // Animation between 0 and 7 is the final value of the bottle. This directly translates to its direction.
    if (animationNumber >= 0 && animationNumber <= 7) {
      if (this._running) {
        this._running = false;
        this._stateQueue.push(
          FurnitureBottleVisualization.ANIMATION_ID_OFFSET_SLOW1
        );
        this._stateQueue.push(
          FurnitureBottleVisualization.ANIMATION_ID_OFFSET_SLOW2 +
            animationNumber
        );
        this._stateQueue.push(animationNumber);
        return;
      }

      this._base.updateAnimation(animation);
    }
  }
}
