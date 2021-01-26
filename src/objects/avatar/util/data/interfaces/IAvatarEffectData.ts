export interface IAvatarEffectData {
  getFrameCount(): number;
  getFrameBodyParts(frame: number): AvatarEffectFrameBodypart[];
  getSprites(): AvatarEffectSprite[];
  getSpriteDirection(
    id: string,
    direction: number
  ): AvatarEffectSpriteDirection | undefined;
}

export interface AvatarEffectFrameBodypart {
  id: string;
  action: string;
  frame: number;
  dx: number;
  dy: number;
  dd: number;
}

export interface AvatarEffectSprite {
  id: string;
  ink?: number;
  member: string;
  staticY?: number;
}

export interface AvatarEffectSpriteDirection {
  id: number;
  dz: number;
}
