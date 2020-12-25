import {
  getAvatarDrawDefinition,
  AvatarDrawDefinition,
  AvatarDependencies,
} from "./getAvatarDrawDefinition";
import { parseLookString } from "./parseLookString";
import { AvatarAction } from "../enum/AvatarAction";
import { AvatarEffectData } from "./data/AvatarEffectData";
import { IAvatarEffectData } from "./data/interfaces/IAvatarEffectData";

export interface LookOptions {
  look: string;
  actions: Set<AvatarAction>;
  direction: number;
  item?: string | number;
  effect?: { type: "dance" | "fx"; id: string };
  initial?: boolean;
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
    { look, actions, direction, item }: LookOptions,
    effect?: IAvatarEffectData
  ) => {
    return getAvatarDrawDefinition(
      {
        parsedLook: parseLookString(look),
        actions,
        direction,
        frame: 0,
        item: item,
        effect: effect,
      },
      dependencies
    );
  };
}
