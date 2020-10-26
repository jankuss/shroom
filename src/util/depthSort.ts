interface RoomEntityWithBehindItems extends DepthSortable {
  itemsBehind: Set<string>;
}

interface DepthCheckBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  zmin: number;
  zmax: number;
}

export interface DepthSortable {
  x: number;
  y: number;
  z: number;
  dim0X: number;
  dim0Y: number;
  dim0Z: number;
  direction: number;
  primary: boolean;
}

function isBoxInFront(box1: DepthCheckBox, box2: DepthCheckBox) {
  // test for intersection y-axis
  // (lower y value is in front)
  if (box1.ymin >= box2.ymax) {
    return false;
  } else if (box2.ymin >= box1.ymax) {
    return true;
  }

  // test for intersection x-axis
  // (lower x value is in front)
  if (box1.xmin >= box2.xmax) {
    return false;
  } else if (box2.xmin >= box1.xmax) {
    return true;
  }

  // test for intersection z-axis
  // (higher z value is in front)
  if (box1.zmin >= box2.zmax) {
    return true;
  } else if (box2.zmin >= box1.zmax) {
    return false;
  }

  return false;
}

function isInBox(box1: DepthCheckBox, box2: DepthCheckBox) {
  return (
    box1.xmin <= box2.xmin &&
    box1.xmax >= box2.xmax &&
    box1.ymin <= box2.ymin &&
    box1.ymax >= box2.ymax &&
    box2.zmin <= box1.zmin &&
    box2.zmax >= box1.zmax
  );
}

function getDepthCheckBox(
  item: DepthSortable,
  xmax: number,
  ymax: number
): DepthCheckBox {
  let itemMinX = 0;
  let itemMaxX = 0;

  let itemMinY = 0;
  let itemMaxY = 0;

  let itemMinZ = 0;
  let itemMaxZ = 0;

  switch (item.direction) {
    case 0:
      itemMinX = item.x;
      itemMaxX = item.x + item.dim0X;

      itemMinY = item.y;
      itemMaxY = item.y + item.dim0Y;
      break;
    case 2:
      itemMinX = item.x;
      itemMaxX = item.x + item.dim0Y;

      itemMinY = item.y;
      itemMaxY = item.y + item.dim0X;
      break;
    case 4:
      itemMinX = item.x;
      itemMaxX = item.x + item.dim0X;

      itemMinY = item.y;
      itemMaxY = item.y + item.dim0Y;
      break;
    case 6:
      itemMinX = item.x;
      itemMaxX = item.x + item.dim0Y;

      itemMinY = item.y;
      itemMaxY = item.y + item.dim0X;
      break;
  }

  return {
    ymax: xmax - itemMinX - 1,
    ymin: xmax - itemMaxX - 1,
    xmax: ymax - itemMinY - 1,
    xmin: ymax - itemMaxY - 1,
    zmin: item.z,
    zmax: item.z + item.dim0Z
  };
}

export function depthSort<T extends DepthSortable>(
  items: Map<string, T>,
  heightmap: any[][]
) {
  const itemsWithItemsBehind: Map<
    string,
    RoomEntityWithBehindItems
  > = new Map();

  const xmax = heightmap[0].length;
  const ymax = heightmap.length;

  const excludedItems = new Set<string>();
  const itemsInBoxMap = new Map<string, Set<string>>();

  items.forEach((item, id) => {
    const depthBox = getDepthCheckBox(item, xmax, ymax);
    const itemsInBox = new Set<string>();

    items.forEach((checkItem, checkId) => {
      if (checkId === id) return;
      if (checkItem.primary) return;

      const checkDepthBox = getDepthCheckBox(checkItem, xmax, ymax);

      if (isInBox(depthBox, checkDepthBox) && !excludedItems.has(checkId)) {
        itemsInBox.add(checkId);
        excludedItems.add(checkId);
      }
    });

    itemsInBoxMap.set(id, itemsInBox);
  });

  items.forEach((item, id) => {
    const itemsBehind = new Set<string>();

    const depthBox = getDepthCheckBox(
      item,
      heightmap[0].length,
      heightmap.length
    );

    if (id === "item_sofa2") {
      console.log("DP", id, depthBox);
    }

    items.forEach((checkItem, checkId) => {
      if (checkId === id) return;
      if (excludedItems.has(checkId)) return;

      const checkDepthBox = getDepthCheckBox(
        checkItem,
        heightmap[0].length,
        heightmap.length
      );

      if (isBoxInFront(depthBox, checkDepthBox)) {
        itemsBehind.add(checkId);
      }
    });

    itemsWithItemsBehind.set(id, {
      ...item,
      itemsBehind
    });
  });

  const order: string[] = [];
  const drawn: Set<string> = new Set();

  function draw(ids: string[], current: Set<string>) {
    ids.forEach(id => {
      if (current.has(id)) {
        console.error("LOOP DETECTED", id, current);
        return;
      }

      const item = itemsWithItemsBehind.get(id);
      if (item == null) return;

      draw(Array.from(item.itemsBehind), new Set([...current, id]));

      if (drawn.has(id)) return;

      drawn.add(id);
      order.push(id);
    });
  }

  const drawBasicKeys = Array.from(items)
    .filter(([id, element]) => !excludedItems.has(id))
    .map(([id]) => id);

  draw(drawBasicKeys, new Set());

  return order.map(id => {
    return {
      ...items.get(id)!,
      itemsInBox: Array.from(itemsInBoxMap.get(id)!).map(id => items.get(id)!)
    };
  });
}
