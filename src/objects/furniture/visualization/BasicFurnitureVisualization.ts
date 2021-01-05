import { IFurnitureVisualization } from "../IFurnitureVisualization";
import { IFurnitureVisualizationView } from "../IFurnitureVisualizationView";
import { FurnitureVisualization } from "./FurnitureVisualization";

export class BasicFurnitureVisualization extends FurnitureVisualization {
  private _sprites: PIXI.Sprite[] = [];

  update(view: IFurnitureVisualizationView): void {
    this._sprites.forEach((sprite) => {
      sprite.destroy();
    });

    this._sprites = [];

    view.furniture
      .getDrawDefinition(view.direction, view.animation)
      .parts.forEach((part) => {
        const sprite = view.createSprite(part, 0);

        if (sprite != null) {
          this._sprites.push(sprite);
          view.container.addChild(sprite);
        }
      });
  }

  updateFrame(frame: number): void {}

  destroy(): void {
    this._sprites.forEach((sprite) => sprite.destroy());
  }
}
