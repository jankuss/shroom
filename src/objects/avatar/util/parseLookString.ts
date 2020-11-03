export type ParsedLook = Map<string, { setId: number; colorId: number }>;

// hd-185-1.hr-828-61.ha-1012-110.ch-255-66.lg-280-110.sh-305-62
export function parseLookString(look: string): ParsedLook {
  return new Map(
    look.split(".").map(str => {
      const partData = str.split("-");

      return [
        partData[0],
        {
          setId: Number(partData[1]),
          colorId: Number(partData[2])
        }
      ] as const;
    })
  );
}
