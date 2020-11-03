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
  "ri" // Right item
]);

const sitActionTypes = new Set([
  "bd", // Body
  "sh", // Shoes
  "lg" // Legs
]);

const wavLeftActionTypes = new Set(["lc", "ls", "lh"]);

export function getNormalizedPart(
  action: string,
  frame: number,
  type: string
): { action: string; frame: number } {
  if (action === "wav" && !wavLeftActionTypes.has(type)) {
    return {
      action: "std",
      frame: 0
    };
  }

  if (action === "wlk" && !walkActionTypes.has(type)) {
    return {
      action: "std",
      frame: 0
    };
  }

  if (action === "sit" && !sitActionTypes.has(type)) {
    return {
      action: "std",
      frame: 0
    };
  }

  return {
    action,
    frame
  };
}
