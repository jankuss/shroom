import { LookOptions } from "../objects/avatar/util/createLookServer";
import { AvatarDrawDefinition } from "../objects/avatar/util/getAvatarDrawDefinition";
import { HitTexture } from "../objects/hitdetection/HitTexture";

export interface IAvatarLoader {
  getAvatarDrawDefinition(look: string): Promise<AvatarLoaderResult>;
}

export type AvatarLoaderResult = {
  getDrawDefinition(options: LookOptions): AvatarDrawDefinition;
  getTexture: (id: string) => HitTexture;
};
