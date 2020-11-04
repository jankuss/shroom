export function filterDrawOrder(
  drawOrder: Set<string>,
  action: string,
  direction: number
) {
  const drawOrderArray = [...drawOrder];

  if (action === "wlk" && (direction === 1 || direction === 5)) {
    const index = drawOrderArray.indexOf("ls");

    if (index !== -1) {
      drawOrderArray[index] = "rs";
    }
  }

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

  const drawOrderCopy = new Set<string>(drawOrderArrayWithCenterItems);

  if (direction === 0 || direction === 7) {
    // Avatar is facing away, no need to draw facial parts.
    drawOrderCopy.delete("fc");
    drawOrderCopy.delete("ey");
  }

  return drawOrderCopy;
}
