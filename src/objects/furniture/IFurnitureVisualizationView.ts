import { FurnitureSprite } from "./FurnitureSprite";
import { FurniDrawPart } from "./util/DrawDefinition";
import { LoadFurniResult } from "./util/loadFurni";

export interface IFurnitureVisualizationView {
  furniture: LoadFurniResult;

  createSprite(part: FurniDrawPart, index: number): FurnitureSprite | undefined;
  destroySprite(sprite: FurnitureSprite): void;
}
