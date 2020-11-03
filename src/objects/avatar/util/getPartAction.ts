const walkFallbackToStanding = new Set([
  "ch",
  "hd",
  "fc",
  "ey",
  "hr",
  "hrb",
  "ha"
]);

export function getPartAction(action: string, type: string) {
  if (action === "wlk" && walkFallbackToStanding.has(type)) {
    return "std";
  }

  return action;
}

export function getPartFrame(action: string, type: string, frame: number) {
  if (action === "wlk" && walkFallbackToStanding.has(type)) {
    return 0;
  }

  return frame;
}
