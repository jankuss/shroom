export interface IAvatarManifestData {
  getAssets(): ManifestAsset[];
  getAliases(): ManifestAlias[];
  getAssetByName(name: string): ManifestAsset | undefined;
}

export interface ManifestAsset {
  name: string;
  x: number;
  y: number;
  flipH: boolean;
  flipV: boolean;
}

export interface ManifestAlias {
  name: string;
  link: string;
  fliph: boolean;
  flipv: boolean;
}
