import {
  IFurnitureBehavior,
  IFurniture,
  IFurnitureData,
} from "@jankuss/shroom";

export class FurniInfoBehavior implements IFurnitureBehavior {
  private parent: IFurniture | undefined;

  constructor(private furnitureData: IFurnitureData) {}

  setParent(furniture: IFurniture): void {
    this.parent = furniture;
    this.parent.onClick = async (e) => {
      const info = await this.furnitureData.getInfoForFurniture(furniture);
    };
  }
}
