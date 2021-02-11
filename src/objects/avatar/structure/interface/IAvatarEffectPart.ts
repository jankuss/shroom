import { IAvatarEffectData } from "../../data/interfaces/IAvatarEffectData";

export interface IAvatarEffectPart {
  setDirection(direction: number): void;
  setDirectionOffset(offset: number): void;
  setEffectFrame(effect: IAvatarEffectData, frame: number): void;
  setEffectFrameDefaultIfNotSet(): void;
}
