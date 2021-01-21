import { IFurnitureVisualization } from "../IFurnitureVisualization";
import { IFurnitureVisualizationView } from "../IFurnitureVisualizationView";

export abstract class FurnitureVisualization
  implements IFurnitureVisualization {
  protected _view: IFurnitureVisualizationView | undefined;
  protected _previousView: IFurnitureVisualizationView | undefined;

  protected get view() {
    if (this._view == null) throw new Error("No view mounted");

    return this._view;
  }

  protected get previousView() {
    return this._previousView;
  }

  protected get mounted() {
    return this._view != null;
  }

  setView(view: IFurnitureVisualizationView): void {
    this._previousView = this._view;
    this._view = view;
  }

  isAnimated(animation = "0"): boolean {
    const frameCount = this._view?.furniture.visualizationData.getFrameCountWithoutRepeat(
      64,
      Number(animation)
    );

    if (frameCount != null) {
      return frameCount > 1;
    }

    return false;
  }

  abstract update(): void;
  abstract destroy(): void;

  abstract updateFrame(frame: number): void;
  abstract updateDirection(direction: number): void;
  abstract updateAnimation(animation: string): void;
}
