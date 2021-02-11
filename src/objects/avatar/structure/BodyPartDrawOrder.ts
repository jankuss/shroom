export class BodyPartDrawOrder {
  static getDrawOrder(
    direction: number,
    drawOrderType: "std" | "lh-up" | "rh-up"
  ): string[] | undefined {
    switch (drawOrderType) {
      case "std":
        return drawOrdersDefault[direction];
      case "rh-up":
        return drawOrdersRightHandActive[direction];
      case "lh-up":
        return drawOrdersLeftHandActive[direction];
    }

    throw new Error(`Invalid draw order type ${drawOrderType}`);
  }
}

// We hardcode the draw orders for each direction. The flash client uses some matrix system based on the
// radius in the geometry for this, which is what we should aim for.

const drawOrdersDefault: DrawOrderList = {
  0: [
    "behind",
    "bottom",
    "leftitem",
    "leftarm",
    "torso",
    "rightitem",
    "rightarm",
    "head",
    "top",
  ],
  1: [
    "behind",
    "bottom",
    "leftitem",
    "leftarm",
    "torso",
    "rightitem",
    "rightarm",
    "head",
    "top",
  ],
  2: [
    "behind",
    "bottom",
    "leftitem",
    "leftarm",
    "torso",
    "rightitem",
    "rightarm",
    "head",
    "top",
  ],
  3: [
    "behind",
    "bottom",
    "torso",
    "leftitem",
    "leftarm",
    "rightitem",
    "rightarm",
    "head",
    "top",
  ],
  4: [
    "behind",
    "bottom",
    "rightarm",
    "rightitem",
    "torso",
    "leftitem",
    "leftarm",
    "head",
    "top",
  ],
  5: [
    "behind",
    "bottom",
    "rightarm",
    "rightitem",
    "torso",
    "leftitem",
    "leftarm",
    "head",
    "top",
  ],
  6: [
    "bottom",
    "rightarm",
    "rightitem",
    "torso",
    "leftitem",
    "leftarm",
    "head",
    "behind",
    "top",
  ],
  7: [
    "bottom",
    "rightarm",
    "rightitem",
    "leftitem",
    "leftarm",
    "torso",
    "head",
    "behind",
    "top",
  ],
};

const drawOrdersRightHandActive: DrawOrderList = {
  ...drawOrdersDefault,
  2: [
    "behind",
    "bottom",
    "leftitem",
    "leftarm",
    "torso",
    "head",
    "rightitem",
    "rightarm",
    "top",
  ],
  3: [
    "behind",
    "bottom",
    "leftitem",
    "leftarm",
    "torso",
    "head",
    "rightitem",
    "rightarm",
    "top",
  ],
  4: [
    "behind",
    "bottom",
    "rightarm",
    "torso",
    "leftitem",
    "leftarm",
    "head",
    "rightitem",
    "top",
  ],
};

const drawOrdersLeftHandActive: DrawOrderList = {
  ...drawOrdersDefault,
  5: [
    "behind",
    "bottom",
    "rightarm",
    "rightitem",
    "torso",
    "head",
    "leftitem",
    "leftarm",
    "top",
  ],
  6: [
    "behind",
    "bottom",
    "rightarm",
    "rightitem",
    "torso",
    "head",
    "leftitem",
    "leftarm",
    "top",
  ],
};

interface DrawOrderList {
  [key: number]: string[] | undefined;
}
