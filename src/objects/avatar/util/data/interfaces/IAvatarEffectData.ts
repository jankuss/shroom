export interface IAvatarEffectData {
  getFrameCount(): number;
  getFrameParts(frame: number): AvatarEffectFrame[];
}

export type AvatarEffectFrame = {
  type: "bodypart";
  id: string;
  action: string;
  frame: number;
  dx: number;
  dy: number;
};
