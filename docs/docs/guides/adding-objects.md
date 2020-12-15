---
id: adding-objects
title: Adding objects
---

The room is so empty right now. Let's add a character and a sofa for him to sit on.
We do this by using the `FloorFurniture` and `Avatar` classes.

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

const furni = new FloorFurniture({
  roomX: 0,
  roomY: 0,
  roomZ: 0,
  direction: 4,
  type: "club_sofa",
});

const avatar = new Avatar({
  look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
  direction: 4,
  roomX: 0,
  roomY: 0,
  roomZ: 0,
});

avatar.action = "sit";

room.addRoomObject(furni);
room.addRoomObject(avatar);

room.x = 100;
room.y = 200;

application.stage.addChild(room);
```
