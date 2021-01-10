export function addMissingDrawOrderItems(drawOrder: Set<string>): string[] {
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
