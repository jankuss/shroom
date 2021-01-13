export const isTile = (type: number | "x"): type is number =>
  !isNaN(Number(type));
