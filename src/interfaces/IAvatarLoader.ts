import { AvatarDrawDefinition } from "../objects/avatar/structure/AvatarDrawDefinition";
import { LookOptions } from "../objects/avatar/util/createLookServer";
import { HitTexture } from "../objects/hitdetection/HitTexture";

export interface IAvatarLoader {
  getAvatarDrawDefinition(
    options: LookOptions & { initial?: boolean }
  ): Promise<AvatarLoaderResult>;
}

export type AvatarLoaderResult = {
  getTexture(id: string): HitTexture;
  getDrawDefinition(options: LookOptions): AvatarDrawDefinition;
};
