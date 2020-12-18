export const validActionsForPartType = {
  bd: new Set(["sit", "lay", "wlk"]),
  hd: new Set(["lsp", "lay", "spk"]),
  fa: new Set(["lsp", "lay"]),
  ea: new Set(["lay"]),
  ey: new Set(["agr", "sad", "sml", "srp", "lag", "lsp", "lay", "eyb"]),
  fc: new Set(["agr", "blw", "sad", "spk", "srp", "sml", "lsp", "lay"]),
  hr: new Set(["lay"]),
  hrb: new Set(["lay"]),
  he: new Set(["lay"]),
  ha: new Set(["spk", "lay"]),
  ch: new Set(["lay"]),
  cc: new Set(["lay"]),
  ca: new Set(["lay"]),
  lg: new Set(["sit", "wlk", "lay"]),
  lh: new Set(["respect", "sig", "wav", "wlk", "lay"]),
  ls: new Set(["wlk", "wav", "lay"]),
  lc: new Set(["wlk", "wav", "lay"]),
  rh: new Set(["drk", "crr", "wlk", "lay", "blw"]),
  rs: new Set(["drk", "crr", "wlk", "lay"]),
  rc: new Set(["drk", "crr", "wlk", "lay"]),
  ri: new Set(["crr", "drk"]),
  li: new Set(["sig"]),
  sh: new Set(["sit", "wlk", "lay"]),
};

export function getValidActionForType(type: string): Set<string> {
  return (
    validActionsForPartType[type as keyof typeof validActionsForPartType] ??
    new Set()
  );
}
