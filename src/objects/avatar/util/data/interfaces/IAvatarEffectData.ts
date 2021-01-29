export interface IAvatarEffectData {
  getFrameCount(): number;
  getFrameBodyParts(frame: number): AvatarEffectFrameBodypart[];
  getFrameBodyPart(
    bodyPartId: string,
    frame: number
  ): AvatarEffectFrameBodypart | undefined;
  getFrameEffectParts(frame: number): AvatarEffectFrameFXPart[];
  getSprites(): AvatarEffectSprite[];
  getSpriteDirection(
    id: string,
    direction: number
  ): AvatarEffectSpriteDirection | undefined;
  getDirection(): AvatarEffectDirection | undefined;
  getAddtions(): AvatarEffectFXAddition[];
}

export interface AvatarEffectFXAddition {
  id: string;
  align?: string;
}

export interface AvatarEffectFrameFXPart {
  id: string;
  action?: string;
  frame?: number;
  dx?: number;
  dy?: number;
  dd?: number;
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
  member?: string;
  staticY?: number;
  directions: boolean;
}

export interface AvatarEffectSpriteDirection {
  id: number;
  dz?: number;
}

export interface AvatarEffectDirection {
  offset: number;
}
