import { ParsedLook } from "./parseLookString";
import { GetSetType } from "./parseFigureData";
import { getNormalizedAvatarDirection } from "./getNormalizedAvatarDirection";
import { GetDrawOrder } from "./parseDrawOrder";
import { filterDrawOrder } from "./filterDrawOrder";
import { getNormalizedPart } from "./getNormalizedPart";
import { GetOffset } from "./loadOffsetMap";
import { notNullOrUndefined } from "../../../util/notNullOrUndefined";

export type AvatarDrawPart = {
  fileId: string;
  x: number;
  y: number;
  color: string | undefined;
  mode: "colored" | "just-image";
};

export interface AvatarDrawDefinition {
  mirrorHorizontal: boolean;
  width: number;
  height: number;
  parts: AvatarDrawPart[];
}

export interface Dependencies {
  getSetType: GetSetType;
  getDrawOrder: GetDrawOrder;
  getOffset: GetOffset;
}

interface Options {
  parsedLook: ParsedLook;
  action: string;
  frame: number;
  direction: number;
}

/**
 * Returns a definition of how the avatar should be drawn.
 * @param options Look options
 * @param dependencies External figure data, draw order and offsets
 */
export function getAvatarDrawDefinition(
  { parsedLook, action, direction, frame }: Options,
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
    getDrawOrder(action, normalizedDirection.direction.toString()) ||
    getDrawOrder("std", normalizedDirection.direction.toString());

  if (drawOrderRaw) {
    // Filter the draw order, since in some directions not every part needs to be drawn.
    const drawOrder = Array.from(
      filterDrawOrder(
        new Set(drawOrderRaw),
        action,
        normalizedDirection.direction
      )
    );

    const rectHeight = 110;
    const rectWidth = 64;

    const drawParts = drawOrder
      .map((type) => {
        return map.get(type);
      })
      .filter(notNullOrUndefined)
      .flatMap((parts) => {
        return parts.map((p) => {
          const part = getNormalizedPart(action, frame, p.type);

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
      height: rectHeight,
      width: rectWidth,
      mirrorHorizontal: normalizedDirection.mirrorHorizontal,
      parts: drawParts,
    };
  }

  return;
}
