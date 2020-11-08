type DrawOrderItem = string | { original: string; override: string };

const replace = (items: DrawOrderItem[], item: string, newItem: string) => {
  const index = items.indexOf(item);

  if (index !== -1) {
    items[index] = { original: item, override: newItem };
  }
};

const remove = (items: string[], item: string) => {
  return items.filter((value) => value !== item);
};

export function filterDrawOrder(
  drawOrder: Set<string>,
  action: string,
  waving: boolean,
  direction: number
): DrawOrderItem[] {
  const drawOrderArray = [...drawOrder];

  const drawOrderArrayWithCenterItems: string[] = [];

  drawOrderArray.forEach((item) => {
    drawOrderArrayWithCenterItems.push(item);

    switch (item) {
      case "ls":
        drawOrderArrayWithCenterItems.push("lc");
        break;

      case "rs":
        drawOrderArrayWithCenterItems.push("rc");
        break;

      case "ch":
        drawOrderArrayWithCenterItems.push("cc");
        drawOrderArrayWithCenterItems.push("cp");
        break;
    }
  });

  if (action !== "wlk" && (direction === 1 || direction === 5)) {
    if (!waving) {
      const indexOfLeftSide = drawOrderArrayWithCenterItems.indexOf("ls");
      replace(drawOrderArrayWithCenterItems, "rs", "ls");

      if (indexOfLeftSide !== -1) {
        drawOrderArrayWithCenterItems.splice(indexOfLeftSide, 1);
      }
    } else {
      replace(drawOrderArrayWithCenterItems, "rs", "ls");
    }
  }

  if (direction === 0 || direction === 7) {
    // Avatar is facing away, no need to draw facial parts.
    remove(drawOrderArrayWithCenterItems, "fc");
    remove(drawOrderArrayWithCenterItems, "ey");
  }

  return drawOrderArrayWithCenterItems;
}
