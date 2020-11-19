import { LookOptions } from "../objects/avatar/util/createLookServer";
import { AvatarDrawDefinition } from "../objects/avatar/util/getAvatarDrawDefinition";

export interface IAvatarLoader {
  getAvatarDrawDefinition(look: string): Promise<AvatarLoaderResult>;
}

export type AvatarLoaderResult = {
  getDrawDefinition(options: LookOptions): AvatarDrawDefinition;
  getTexture: (id: string) => PIXI.Texture;
};
