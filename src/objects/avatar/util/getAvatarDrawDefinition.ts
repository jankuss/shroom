import { ParsedLook } from "./parseLookString";
import { GetSetType } from "./parseFigureData";
import { getNormalizedAvatarDirection } from "./getNormalizedAvatarDirection";
import { GetDrawOrder } from "./parseDrawOrder";
import { filterDrawOrder } from "./filterDrawOrder";
import { getNormalizedPart } from "./getNormalizedPart";
import { GetOffset } from "./loadOffsetMap";
import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { getActionForPart } from "./getActionForPart";
import { getDrawOrder } from "./drawOrder";

export type AvatarDrawPart = {
  fileId: string;
  library: string;
  x: number;
  y: number;
  color: string | undefined;
  mode: "colored" | "just-image";
};

export interface AvatarDrawDefinition {
  mirrorHorizontal: boolean;
  parts: AvatarDrawPart[];
  offsetX: number;
  offsetY: number;
}

export interface Dependencies {
  getSetType: GetSetType;
  getOffset: GetOffset;
  getLibraryOfPart: (id: string, type: string) => string | undefined;
}

export type PrimaryAction =
  | { kind: "std" }
  | { kind: "sit" }
  | { kind: "lay" }
  | { kind: "wlk"; frame: number };

export type PrimaryActionKind = PrimaryAction["kind"];

export type SecondaryActions = {
  wav?: { frame: number };
  item?: { item: number; kind: "drk" | "crr" };
};

export type SecondaryActionKind = keyof SecondaryActions;

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
  { getOffset, getSetType, getLibraryOfPart }: Dependencies
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

  if (actions.item != null) {
    map.set("ri", [
      {
        type: "ri",
        id: actions.item.item.toString(),
        color: undefined,
        colorable: false,
      },
    ]);
  }

  function getDrawOrderType() {
    switch (action.kind) {
      case "sit":
        return "sit";
      case "lay":
        return "lay";
      case "wlk":
        return "std";
    }

    return "std";
  }

  const drawOrderRaw =
    getDrawOrder(getDrawOrderType(), normalizedDirection.direction) ||
    getDrawOrder("std", normalizedDirection.direction);

  if (drawOrderRaw) {
    // Filter the draw order, since in some directions not every part needs to be drawn.
    const drawOrder = Array.from(
      filterDrawOrder(
        new Set(drawOrderRaw),
        action.kind,
        actions.wav != null,
        normalizedDirection.direction
      )
    );

    const allActions = new Set<string>();
    allActions.add(action.kind);

    if (actions.item != null) {
      allActions.add(actions.item.kind);
    }

    if (actions.wav != null) {
      allActions.add("wav");
    }

    const drawParts = drawOrder
      .flatMap((drawOrderItem) => {
        const parts =
          map.get(
            typeof drawOrderItem === "string"
              ? drawOrderItem
              : drawOrderItem.override
          ) ?? [];

        const original =
          typeof drawOrderItem === "string"
            ? drawOrderItem
            : drawOrderItem.original;

        return parts.flatMap((p) => {
          const part = getActionForPart(allActions, 0, original, {
            walkFrame: action.kind === "wlk" ? action.frame : 0,
            waveFrame: actions.wav != null ? actions.wav.frame : 0,
          });

          const id = `h_${part.action}_${p.type}_${p.id}_${normalizedDirection.direction}_${part.frame}`;

          const offset = getOffset(id);
          if (offset == null) return;

          const library = getLibraryOfPart(p.id, p.type);
          if (library == null) {
            throw new Error(`Invalid library ${id} ${p.type}`);
          }

          return {
            fileId: id,
            library: library,
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
      ...getOffsets(action.kind, normalizedDirection.mirrorHorizontal),
    };
  }

  return;
}

function getOffsets(action: PrimaryActionKind, mirror: boolean) {
  if (action === "lay") {
    return {
      offsetX: mirror ? 32 : 48,
      offsetY: 16,
    };
  }

  return {
    offsetX: mirror ? 64 : 0,
    offsetY: 16,
  };
}
