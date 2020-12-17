---
id: adding-windows
title: Adding windows & landscapes
---

## Wall Furniture

To create windows, we will use a `WallFurniture`. A wall furniture is just like a `FloorFurniture`, but for walls.

```ts
import * as PIXI from "pixi.js";

import { Room, FloorFurniture, Avatar, Shroom } from "@jankuss/shroom";

const view = document.querySelector("#root") as HTMLCanvasElement;
const application = new PIXI.Application({ view });

const shroom = Shroom.create({ application, resourcePath: "./resources" });
const room = Room.create(shroom, {
  tilemap: `
    xxxxx
    x0000
    x0000
    x0000
   `,
});

const furni1 = new WallFurniture({
  roomX: 0,
  roomY: 0,
  roomZ: 0,
  direction: 4,
  type: "window_skyscraper",
});

const furni2 = new WallFurniture({
  roomX: 0,
  roomY: 0,
  roomZ: 0,
  direction: 4,
  type: "window_skyscraper",
});

room.addRoomObject(furni1);
room.addRoomObject(furni2);

room.x = 100;
room.y = 200;

application.stage.addChild(room);
```

## Landscapes

The speciality of windows in this case, is that they can display a custom background called a `Landscape`. Landscapes basically are a texture applied to walls which only windows can display.

To create a landscape, use the following code in addition to the previous example.

```ts
/* ...*/

const landscape = new Landscape();
landscape.leftTexture = loadRoomTexture("./images/left.png");
landscape.rightTexture = loadRoomTexture("./images/right.png");
landscape.color = "#ff0000";

room.addRoomObject(landscape);
```
