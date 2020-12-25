export interface IAvatarAnimationData {
  getAnimationFrames(id: string, type: string): AvatarAnimationFrame[];
  getAnimationFramesCount(id: string): number;
}

export type AvatarAnimationFrame = {
  number: number;
  assetpartdefinition: string;
  repeats: number;
};
