export interface IAvatarEffectData {
  getFrameCount(): number;
  getFrameParts(frame: number): AvatarEffectFrameBodypart[];
}

export type AvatarEffectFrameBodypart = {
  type: "bodypart";
  id: string;
  action: string;
  frame: number;
  dx: number;
  dy: number;
  dd: number;
};
