export interface RoomPartData {
  wallHeight: number;
  borderWidth: number;
  tileHeight: number;
  wallLeftColor: number;
  wallRightColor: number;
  wallTopColor: number;
  wallTexture: PIXI.Texture;
  tileLeftColor: number;
  tileRightColor: number;
  tileTopColor: number;
  tileTexture: PIXI.Texture;
  masks: Map<string, PIXI.Sprite>;
}
