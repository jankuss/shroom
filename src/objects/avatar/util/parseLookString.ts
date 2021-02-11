export type ParsedLook = Map<string, { setId: number; colorId: number }>;

export function parseLookString(look: string): ParsedLook {
  return new Map(
    look.split(".").map((str) => {
      const partData = str.split("-");

      return [
        partData[0],
        {
          setId: Number(partData[1]),
          colorId: Number(partData[2]),
        },
      ] as const;
    })
  );
}
