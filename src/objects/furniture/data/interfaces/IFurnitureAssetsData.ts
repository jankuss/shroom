export interface IFurnitureAssetsData {
  getAsset(name: string): FurnitureAsset | undefined;
  getAssets(): FurnitureAsset[];
}

export interface FurnitureAsset {
  name: string;
  x: number;
  y: number;
  flipH: boolean;
  source?: string;
  valid: boolean;
}
