export interface IAssetBundle {
  getBlob(name: string): Promise<Blob>;
  getString(name: string): Promise<string>;
}
