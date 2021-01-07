import { FurnitureSprite } from "../FurnitureSprite";
import { IFurnitureVisualizationView } from "../IFurnitureVisualizationView";
import { FurnitureVisualization } from "./FurnitureVisualization";

export class BasicFurnitureVisualization extends FurnitureVisualization {
  private _sprites: FurnitureSprite[] = [];
  private _refreshFurniture: boolean = false;

  private _currentDirection: number = 0;
  private _animationId: string | undefined;

  setView(view: IFurnitureVisualizationView): void {
    super.setView(view);

    this._refreshFurniture = true;
  }

  updateDirection(direction: number): void {
    this._currentDirection = direction;
    this._refreshFurniture = true;
  }

  updateAnimation(animation: string): void {
    this._animationId = animation;
    this._refreshFurniture = true;
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

  updateFrame(frame: number): void {
    if (!this.mounted) return;

    if (this._refreshFurniture) {
      this._refreshFurniture = false;
      this._update();
    }
  }

  update() {
    this._refreshFurniture = true;
  }

  destroy(): void {
    this._sprites.forEach((sprite) => this.view.destroySprite(sprite));
  }
}
