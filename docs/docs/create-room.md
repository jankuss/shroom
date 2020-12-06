---
id: create-room
title: Create a room
---

The Room class is the most essential part of shroom.

The simplest way to create a room is by using the following code.
This will create a 4x3 room.

```ts
import * as PIXI from "pixi.js";

import { Room, FloorFurniture, Avatar, Shroom } from "@jankuss/shroom";

const view = document.querySelector("#root") as HTMLCanvasElement;
const application = new PIXI.Application({ view });

const shroom = Shroom.create({ application, resourcePath: "./resources" });
const room = Room.create(shroom, {
  tilemap: `
    0000
    0000
    0000
   `,
});

room.x = 100;
room.y = 200;

application.stage.addChild(room);
```
