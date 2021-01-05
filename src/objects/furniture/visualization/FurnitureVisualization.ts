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

  abstract destroy(): void;
  update(view: IFurnitureVisualizationView): void {
    this._previousView = this._view;
    this._view = view;
  }
  abstract updateFrame(frame: number): void;
}
