import { ParsedLook } from "./parseLookString";
import { AvatarAction } from "../enum/AvatarAction";
import { IAvatarEffectData } from "../data/interfaces/IAvatarEffectData";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { AvatarDrawDefinition } from "../structure/AvatarDrawDefinition";
import { AvatarDependencies } from "../types";

export const basePartSet = new Set<AvatarFigurePartType>([
  AvatarFigurePartType.LeftHand,
  AvatarFigurePartType.RightHand,
  AvatarFigurePartType.Body,
  AvatarFigurePartType.Head,
]);

/**
 * Returns a definition of how the avatar should be drawn.
 * @param options Look options
 * @param deps External figure data, draw order and offsets
 */
export function getAvatarDrawDefinition(
  {
    parsedLook,
    actions: initialActions,
    direction,
    headDirection,
    item: itemId,
    effect,
  }: Options,
  deps: AvatarDependencies
): AvatarDrawDefinition | undefined {
  const actions = new Set(initialActions).add(AvatarAction.Default);
  const def = new AvatarDrawDefinition(
    {
      actions,
      direction,
      frame: 0,
      look: parsedLook,
      item: itemId,
      headDirection,
      effect,
    },
    deps
  );

  return def;
}

interface Options {
  parsedLook: ParsedLook;
  actions: Set<string>;
  direction: number;
  headDirection?: number;
  frame: number;
  item?: string | number;
  effect?: IAvatarEffectData;
}
