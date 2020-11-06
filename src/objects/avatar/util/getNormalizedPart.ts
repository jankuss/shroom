// Part types which are affected during the walk action
const walkActionTypes = new Set([
  "li", // Left item
  "lh", // Left hand
  "ls", // Left side
  "bd", // Body
  "sh", // Shoes
  "lg", // Legs
  "rh", // Right hand
  "rs", // Right side
  "ri", // Right item
  "rc",
  "lc",
]);

const sitActionTypes = new Set([
  "bd", // Body
  "sh", // Shoes
  "lg", // Legs
]);

const wavLeftActionTypes = new Set(["lc", "ls", "lh"]);

const map = new Map<string, Set<string>>([
  ["wav", wavLeftActionTypes],
  ["wlk", walkActionTypes],
  ["sit", sitActionTypes],
]);

export function getNormalizedPart({
  actions,
  action,
  frame,
  type,
}: {
  actions: Set<string>;
  action: string;
  frame: number;
  type: string;
}): { action: string; frame: number } | undefined {
  const sittingAndWaving = actions.has("sit") && actions.has("wav");
  const walkingAndWaving = actions.has("wav") && actions.has("wlk");

  if (walkingAndWaving) {
    if (wavLeftActionTypes.has(type)) {
      return { action: "wav", frame: 0 };
    }

    if (walkActionTypes.has(type)) {
      return { action: "wlk", frame };
    }

    return { action: "std", frame: 0 };
  }

  if (sittingAndWaving) {
    if (!wavLeftActionTypes.has(type)) {
      return;
    }

    if (!sitActionTypes.has(type)) {
      return;
    }
  }

  if (actions.has("wlk") && !walkActionTypes.has(type)) {
    return;
  }

  if (actions.has("sit") && !sitActionTypes.has(type)) {
    return;
  }

  if (actions.has("wav") && !wavLeftActionTypes.has(type)) {
    return;
  }

  return {
    action,
    frame,
  };
}
