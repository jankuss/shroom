import { FurnitureSprite } from "../FurnitureSprite";
import { IFurnitureVisualizationView } from "../IFurnitureVisualizationView";
import { FurnitureVisualization } from "./FurnitureVisualization";

export class BasicFurnitureVisualization extends FurnitureVisualization {
  private _sprites: FurnitureSprite[] = [];
  private _refreshFurniture = false;
  private _currentDirection = -1;
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
    this._refreshFurniture = true;
    this._update();
  }

  destroy(): void {
    this._sprites.forEach((sprite) => this.view.destroySprite(sprite));
  }

  private _update() {
    this._sprites.forEach((sprite) => {
      this.view.destroySprite(sprite);
    });

    this._sprites = [];

    this.view.furniture
      .getDrawDefinition(this._currentDirection, this._animationId)
      .parts.forEach((part) => {
        const sprite = this.view.createSprite(part, 0);

        if (sprite != null) {
          this._sprites.push(sprite);
        }
      });
  }
}
