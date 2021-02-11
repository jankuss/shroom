export interface IAvatarEffectMap {
  getEffectInfo(id: string): AvatarEffect | undefined;
  getEffects(): AvatarEffect[];
}

export interface AvatarEffect {
  id: string;
  lib: string;
  type: string;
}
