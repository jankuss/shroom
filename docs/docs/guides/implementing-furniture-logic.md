---
id: implementing-furniture-logic
title: Implementing Furniture Logic
---

Different furnitures have all kinds of different behaviors, which are specified in their respective files.
Let's take a look at the furniture `edice`, which is a dice.

A dice is a furniture which has two special click areas. A `activate` and `deactivate` area.
When we double click the `activate` area, we roll the dice.
When we double click the `deactivate` area, we disable the dice.

When we dig deeper into the files of `edice`, there is a `index.bin` file, which specifies a `logic` attribute. This attribute is what we need to know to use the behavior of the dice explained above.

So let's implement it with shroom.

```ts
/**
 * ...
 */

const room = Room.create(shroom, {
  tilemap: `
        xxxx
        x000
        x000
        x000
        `,
});

const furniture = new FloorFurniture({
  roomX: 1,
  roomY: 1,
  roomZ: 0,
  direction: 0,
  animation: "0",
  type: "edice",
});

const handleDice = (furniture: IFurniture) => {
  interface State {
    rolling: boolean;
    value: number;
    active: boolean;
  }

  let state: State = { rolling: false, value: 1, active: false };
  let timeout: any;

  const updateState = (newState: State) => {
    state = newState;

    if (state.rolling) {
      furniture.animation = "-1";
    } else if (state.active) {
      furniture.animation = state.value.toString();
    } else {
      furniture.animation = "0";
    }
  };

  const roll = () => {
    updateState({ ...state, rolling: true, active: true });

    clearTimeout(timeout);

    // After 1 seconds, we set the dice value
    timeout = setTimeout(() => {
      updateState({
        ...state,
        rolling: false,
        value: Math.floor(Math.random() * 6) + 1,
      });
    }, 1000);
  };

  const deactivate = () => {
    updateState({ ...state, rolling: false, active: !state.active });
  };

  furniture.onDoubleClick = (event) => {
    switch (event.tag) {
      case "activate":
        roll();
        break;

      case "deactivate":
        deactivate();
        break;
    }
  };
};

furniture.extradata.then(({ logic }) => {
  switch (logic) {
    // Here you should handle every possible logic a furniture can have.
    // We only handle the dice logic here.
    case "furniture_dice":
      handleDice(furniture);
      break;
  }
});

room.addRoomObject(furniture);
```
