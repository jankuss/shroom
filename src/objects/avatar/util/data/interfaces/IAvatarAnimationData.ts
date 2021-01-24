export interface IAvatarAnimationData {
  getAnimationFrames(id: string, type: string): AvatarAnimationFrame[];
  getAnimationFramesCount(id: string): number;
  getAnimationFrame(
    id: string,
    type: string,
    frame: number
  ): AvatarAnimationFrame | undefined;
}

export type AvatarAnimationFrame = {
  number: number;
  assetpartdefinition: string;
  repeats: number;
};
