import { IFurniture, IFurnitureBehavior } from "../../../dist";

export class FurniInfoBehavior implements IFurnitureBehavior {
  private parent: IFurniture | undefined;

  setParent(furniture: IFurniture): void {
    this.parent = furniture;
    this.parent.onClick = (e) => {};
  }
}
