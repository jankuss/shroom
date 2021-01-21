export interface IAvatarManifestData {
  getAssets(): ManifestAsset[];
}

export interface ManifestAsset {
  name: string;
  x: number;
  y: number;
}
