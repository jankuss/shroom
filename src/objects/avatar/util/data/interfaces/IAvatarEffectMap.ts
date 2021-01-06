export interface IAvatarEffectMap {
  getEffectInfo(
    id: string
  ): { id: string; lib: string; type: string } | undefined;
}
