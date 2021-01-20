import { IFigureData } from "./data/interfaces/IFigureData";
import { ParsedLook } from "./parseLookString";

export function getPartDataForParsedLook(
  parsedLook: ParsedLook,
  figureData: IFigureData
) {
  const partByType = new Map<string, PartData[]>();

  Array.from(parsedLook.entries()).forEach(([type, { setId, colorId }]) => {
    const parts = figureData.getParts(type, setId.toString());
    const colorValue = figureData.getColor(type, colorId.toString());
    const hiddenLayers: string[] = figureData.getHiddenLayers(
      type,
      setId.toString()
    );

    parts?.forEach((part) => {
      const current = partByType.get(part.type) ?? [];

      partByType.set(part.type, [
        ...current,
        {
          ...part,
          color: colorValue,
          hiddenLayers,
          setId: setId.toString(),
          setType: type,
        },
      ]);
    });

    return (parts || []).map((part) => ({
      ...part,
      color: colorValue,
      hiddenLayers,
    }));
  });

  return partByType;
}

export interface PartData {
  color: string | undefined;
  id: string;
  setId?: string;
  setType?: string;
  type: string;
  colorable: boolean;
  hiddenLayers: string[];
  index: number;
}
