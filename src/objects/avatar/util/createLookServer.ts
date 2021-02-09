import { getAvatarDrawDefinition } from "./getAvatarDrawDefinition";
import { parseLookString } from "./parseLookString";
import { AvatarAction } from "../enum/AvatarAction";
import { IAvatarEffectData } from "../data/interfaces/IAvatarEffectData";
import { AvatarDependencies } from "../types";
import { AvatarDrawDefinition } from "../structure/AvatarDrawDefinition";

export interface LookOptions {
  look: string;
  actions: Set<AvatarAction>;
  direction: number;
  headDirection?: number;
  item?: string | number;
  effect?: string;
  initial?: boolean;
  skipCaching?: boolean;
}

export interface LookServer {
  (options: LookOptions, effect?: IAvatarEffectData):
    | AvatarDrawDefinition
    | undefined;
}

export async function createLookServer(
  dependencies: AvatarDependencies
): Promise<LookServer> {
  return (
    { look, actions, direction, headDirection, item }: LookOptions,
    effect?: IAvatarEffectData
  ) => {
    return getAvatarDrawDefinition(
      {
        parsedLook: parseLookString(look),
        actions,
        direction,
        headDirection,
        frame: 0,
        item: item,
        effect: effect,
      },
      dependencies
    );
  };
}
