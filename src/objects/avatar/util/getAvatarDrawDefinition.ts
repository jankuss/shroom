import { ParsedLook } from "./parseLookString";
import { GetSetType } from "./parseFigureData";
import { getNormalizedAvatarDirection } from "./getNormalizedAvatarDirection";
import { GetDrawOrder } from "./parseDrawOrder";
import { filterDrawOrder } from "./filterDrawOrder";
import { getNormalizedPart } from "./getNormalizedPart";
import { GetOffset } from "./loadOffsetMap";
import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { getActionForPart } from "./getActionForPart";

export type AvatarDrawPart = {
  fileId: string;
  x: number;
  y: number;
  color: string | undefined;
  mode: "colored" | "just-image";
};

export interface AvatarDrawDefinition {
  mirrorHorizontal: boolean;
  parts: AvatarDrawPart[];
}

export interface Dependencies {
  getSetType: GetSetType;
  getDrawOrder: GetDrawOrder;
  getOffset: GetOffset;
}

export type PrimaryAction =
  | { kind: "std" }
  | { kind: "sit" }
  | { kind: "lay" }
  | { kind: "wlk"; frame: number };

export type SecondaryActions = {
  wav?: { frame: number };
  item?: { item: number; kind: "drk" | "crr" };
};

interface Options {
  parsedLook: ParsedLook;
  action: PrimaryAction;
  actions: SecondaryActions;
  direction: number;
}

/**
 * Returns a definition of how the avatar should be drawn.
 * @param options Look options
 * @param dependencies External figure data, draw order and offsets
 */
export function getAvatarDrawDefinition(
  { parsedLook, action, actions, direction }: Options,
  { getDrawOrder, getOffset, getSetType }: Dependencies
): AvatarDrawDefinition | undefined {
  const parts = Array.from(parsedLook.entries()).flatMap(
    ([type, { setId, colorId }]) => {
      const setType = getSetType(type);
      if (setType) {
        const colorValue = setType.getColor(colorId.toString());
        const parts = setType.getParts(setId.toString());

        return (parts || []).map((part) => ({
          ...part,
          color: colorValue,
        }));
      }

      return [];
    }
  );

  // Normalize the direction, since the only available directions are 0, 1, 2, 3 and 7.
  // Every other direction can be displayed by mirroring one of the above.
  const normalizedDirection = getNormalizedAvatarDirection(direction);

  const map = new Map<
    string,
    {
      color: string | undefined;
      id: string;
      type: string;
      colorable: boolean;
    }[]
  >();

  parts.forEach((part) => {
    const current = map.get(part.type) ?? [];
    map.set(part.type, [...current, part]);
  });

  const drawOrderRaw =
    getDrawOrder(action.kind, normalizedDirection.direction.toString()) ||
    getDrawOrder("std", normalizedDirection.direction.toString());

  if (drawOrderRaw) {
    // Filter the draw order, since in some directions not every part needs to be drawn.
    const drawOrder = Array.from(
      filterDrawOrder(
        new Set(drawOrderRaw),
        action.kind,
        normalizedDirection.direction
      )
    );

    const allActions = new Set<string>();
    allActions.add(action.kind);

    for (const key in actions) {
      allActions.add(key);
    }

    const drawParts = drawOrder
      .map((type) => map.get(type))
      .filter(notNullOrUndefined)
      .flatMap((parts) => {
        return parts.flatMap((p) => {
          const part = getActionForPart(allActions, 0, p.type, {
            walkFrame: action.kind === "wlk" ? action.frame : 0,
            waveFrame: actions.wav != null ? actions.wav.frame : 0,
          });

          const id = `h_${part.action}_${p.type}_${p.id}_${normalizedDirection.direction}_${part.frame}`;

          const offset = getOffset(id);
          if (offset == null) return;

          return {
            fileId: id,
            x: -offset.offsetX,
            y: -offset.offsetY,
            color: `#${p.color}`,
            mode:
              p.type !== "ey" && p.colorable
                ? ("colored" as const)
                : ("just-image" as const),
          };
        });
      })
      .filter(notNullOrUndefined);

    return {
      mirrorHorizontal: normalizedDirection.mirrorHorizontal,
      parts: drawParts,
    };
  }

  return;
}
