export type ParsedFigureData = ReadonlyMap<
  string,
  ReadonlyMap<string, { id: string; type: string }[]>
>;

export type GetSetType = (
  setType: string
) =>
  | {
      getColor: (colorId: string) => string | undefined;
      getParts: (
        setId: string
      ) => { id: string; type: string; colorable: boolean }[] | undefined;
    }
  | undefined;

export function parseFigureData(
  figureDataXml: any
): { getSetType: GetSetType } {
  const setTypes: any[] = figureDataXml.figuredata.sets[0].settype;
  const palettes: any[] = figureDataXml.figuredata.colors[0].palette;

  const paletteMap = new Map<string, Map<string, string>>();
  palettes.forEach((palette) => {
    const paletteId = palette["$"].id;

    const colorMap = new Map<string, string>();
    palette.color.forEach((color: any) => {
      const colorId = color["$"].id;
      const value = color["_"];

      colorMap.set(colorId, value);
    });

    paletteMap.set(paletteId, colorMap);
  });

  const setTypeMap = new Map<
    string,
    {
      paletteId: string;
      partMap: Map<string, { id: string; type: string; colorable: boolean }[]>;
    }
  >();
  setTypes.forEach((setType) => {
    const type = setType["$"].type;

    const map = new Map<
      string,
      { id: string; type: string; colorable: boolean }[]
    >();

    setType.set.forEach((set: any) => {
      const partsXml: any[] = set.part;

      const parts = partsXml.map((part) => {
        return {
          id: part["$"].id,
          type: part["$"].type,
          colorable: part["$"].colorable === "1",
        };
      });

      map.set(set["$"].id, parts);
    });

    setTypeMap.set(type, {
      paletteId: setType["$"].paletteid,
      partMap: map,
    });
  });

  return {
    getSetType: (setTypeId: string) => {
      const setType = setTypeMap.get(setTypeId);
      if (!setType) return;

      return {
        getColor: (id: string) => {
          const palette = paletteMap.get(setType.paletteId);
          if (!palette) return;

          return palette.get(id);
        },
        getParts: (id: string) => {
          return setType.partMap.get(id);
        },
      };
    },
  };
}
