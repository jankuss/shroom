import { IFurniture, IFurnitureBehavior } from "@jankuss/shroom";

export class MultiStateBehavior implements IFurnitureBehavior {
  private furniture: IFurniture | undefined;
  private currentState: number = 0;

  constructor(private options: { initialState: number; count: number }) {
    this.currentState = this.options.initialState;
    this._updateState();
  }

  private _updateState() {
    const furniture = this.furniture;

    if (furniture != null) {
      furniture.animation = this.currentState.toString();
    }
  }

  setParent(furniture: IFurniture): void {
    this.furniture = furniture;

    this._updateState();

    furniture.onDoubleClick = () => {
      this.currentState = (this.currentState + 1) % this.options.count;
      this._updateState();
    };
  }
}
