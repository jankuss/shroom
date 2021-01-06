import { IFurnitureVisualization } from "../IFurnitureVisualization";
import { IFurnitureVisualizationView } from "../IFurnitureVisualizationView";
import { FurnitureVisualization } from "./FurnitureVisualization";

export class BasicFurnitureVisualization extends FurnitureVisualization {
  private _sprites: PIXI.Sprite[] = [];
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
  }

  private _update() {
    this._sprites.forEach((sprite) => {
      sprite.destroy();
    });

    this._sprites = [];

    this.view.furniture
      .getDrawDefinition(this._currentDirection, this._animationId)
      .parts.forEach((part) => {
        const sprite = this.view.createSprite(part, 0);

        if (sprite != null) {
          this._sprites.push(sprite);
          this.view.container.addChild(sprite);
        }
      });
  }

  updateFrame(frame: number): void {
    if (!this._refreshFurniture) {
      this._refreshFurniture = true;
      this._update();
    }
  }

  destroy(): void {
    this._sprites.forEach((sprite) => sprite.destroy());
  }
}
