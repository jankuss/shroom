export interface IFurnitureAssetsData {
  getAsset(name: string): FurnitureAsset | undefined;
}

export interface FurnitureAsset {
  name: string;
  x: number;
  y: number;
  flipH: boolean;
  source?: string;
  valid: boolean;
}
