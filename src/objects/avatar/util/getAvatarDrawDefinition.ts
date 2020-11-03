import { ParsedLook } from "./parseLookString";
import { GetSetType } from "./parseFigureData";
import { getNormalizedAvatarDirection } from "./getNormalizedAvatarDirection";
import { GetDrawOrder } from "./parseDrawOrder";
import { filterDrawOrder } from "./filterDrawOrder";
import { getNormalizedPart } from "./getNormalizedPart";
import { GetOffset } from "./loadOffsetMap";

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

  const map = new Map(
    parts.map((part) => {
      return [part.type, part] as const;
    })
  );

  // Normalize the direction, since the only available directions are 0, 1, 2, 3 and 7.
  // Every other direction can be displayed by mirroring one of the above.
  const normalizedDirection = getNormalizedAvatarDirection(direction);

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
      .flatMap((type) => {
        const part = map.get(type);
        if (part) return [part];
        return [];
      })
      .map((p) => {
        const part = getNormalizedPart(action, frame, p.type);

        const id = `h_${part.action}_${p.type}_${p.id}_${normalizedDirection.direction}_${part.frame}`;

        const offset = getOffset(id);
        if (!offset) throw new Error(`No offsets found for ${id}`);

        return {
          fileId: id,
          x: -offset.offsetX,
          y: -offset.offsetY,
          color: `#${p.color}`,
          mode:
            p.type !== "ey" ? ("colored" as const) : ("just-image" as const),
        };
      });

    return {
      height: rectHeight,
      width: rectWidth,
      mirrorHorizontal: normalizedDirection.mirrorHorizontal,
      parts: drawParts,
    };
  }

  return;
}
