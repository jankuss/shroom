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

export function filterDrawOrder(drawOrder: Set<string>): string[] {
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

  return drawOrderArrayWithCenterItems;
}
