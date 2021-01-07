---
id: use-base-avatar-and-furniture
title: Using `BaseAvatar` and `BaseFurniture`
---

For some use cases, you want to display avatar or furniture without a room.
You can do this with `BaseAvatar` and `BaseFurniture`. The only thing you need is a `Shroom` instance.

```ts
/**
 * ...
 */

const avatar = BaseAvatar.fromShroom(shroom, {
  look: {
    actions: new Set(),
    direction: 2,
    look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
  },
  position: { x: 0, y: 100 },
  zIndex: 0,
  onLoad: () => {
    // This is called when the avatar has been loaded completly.
    console.log("Loaded");
  },
});

const furniture = BaseFurniture.fromShroom(shroom, application.stage, {
  direction: 2,
  type: { kind: "type", type: "club_sofa" },
  animation: "0",
});

furniture.x = 100;
furniture.y = 50;

application.stage.addChild(avatar);
```
