---
id: create-room
title: Create a room
---

The Room class is the most essential part of shroom.

The simplest way to create a room is by using the following code.
This will create a 4x3 room.

```ts
const view = document.querySelector("#root") as HTMLCanvasElement;
const application = new PIXI.Application({ view });

const room = Room.create({
  application,
  tilemap: `
    0000
    0000
    0000
   `,
  resourcePath: "./resources",
});

room.x = 100;
room.y = 200;

application.stage.addChild(room);
```
