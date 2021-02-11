import { AvatarActionInfo } from "../data/interfaces/IAvatarActionsData";

export function getDrawOrderForActions(
  activeActions: AvatarActionInfo[],
  options: { hasItem: boolean }
) {
  const activePartSets = new Set<string>();
  activeActions.forEach((info) => {
    if (info.activepartset != null) {
      activePartSets.add(info.activepartset);
    }
  });

  if (options.hasItem) {
    activePartSets.add("itemRight");
  }

  if (activePartSets.has("handLeft")) {
    return "lh-up";
  }

  if (
    activePartSets.has("handRightAndHead") ||
    activePartSets.has("handRight")
  ) {
    return "rh-up";
  }

  return "std";
}
