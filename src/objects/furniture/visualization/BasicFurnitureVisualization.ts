import { FurnitureSprite } from "../FurnitureSprite";
import { IFurnitureVisualizationView } from "../IFurnitureVisualizationView";
import { FurnitureVisualization } from "./FurnitureVisualization";

export class StaticFurnitureVisualization extends FurnitureVisualization {
  private _sprites: FurnitureSprite[] = [];
  private _refreshFurniture = false;
  private _currentDirection: number | undefined;
  private _animationId: string | undefined;

  setView(view: IFurnitureVisualizationView): void {
    super.setView(view);
    this._update();
  }

  updateDirection(direction: number): void {
    if (this._currentDirection === direction) return;

    this._currentDirection = direction;
    this._update();
  }

  updateAnimation(animation: string): void {
    if (this._animationId === animation) return;

    this._animationId = animation;
    this._update();
  }

  updateFrame(): void {
    if (!this.mounted) return;

    if (this._refreshFurniture) {
      this._refreshFurniture = false;
      this._update();
    }
  }

  update() {
    this._update();
  }

  destroy(): void {
    // Do nothing
  }

  private _update() {
    if (this._currentDirection == null) return;

    this.view.setDisplayAnimation(this._animationId);
    this.view.setDisplayDirection(this._currentDirection);
    this.view.updateDisplay();
    this.view.getLayers().forEach((layer) => layer.setCurrentFrameIndex(0));
  }
}

/**
 * @deprecated Use `StaticFurnitureVisualization`
 */
export const BasicFurnitureVisualization = StaticFurnitureVisualization;
