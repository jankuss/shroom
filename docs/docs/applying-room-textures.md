---
id: applying-room-textures
title: Applying room textures
---

import useBaseUrl from '@docusaurus/useBaseUrl';

To make a plain room look more exciting, we can add room textures for floors and walls.
We do this by specifying the `wallTexture` and `floorTexture` of the room.

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

// Note: If you are using PIXI Loader and the texture has been preloaded,
// you can also specify the textures like the following.

// room.wallTexture = PIXI.Texture.from("./wall.png")

// The important thing here is that the texture is loaded before use.

room.wallTexture = loadRoomTexture("./images/wall.png");
room.floorTexture = loadRoomTexture("./images/floor.png");

application.stage.addChild(room);
```

### Important note

Both `wallTexture` and `roomTexture` expect a **loaded** texture to work properly.
Another way is to supply a Promise (i.e. by using `loadRoomTexture`),
which resolves after the texture is loaded. If the texture is not loaded before, the room will fail to render properly.

## Texture Format

The texture you provide should have a normal two dimensional look. You don't need to skew it to make it look isometric, since shroom will take care of that automatically.

The default tile texture commonly used looks like the following.
<img alt="Docusaurus with Keytar" src={useBaseUrl('img/tile.png')} />

Be creative and create your unique wall and floor textures. I'm sure your users will enjoy it!

## Adding colors

While we are at it, let's add some colors to the room.

```ts
room.wallColor = "#dbbe6e";
room.floorColor = "#eeeeee";
```

## Result

Your room will now look like this, depending on the textures and colors you provided.
In this example, we used the tile picture above both for floor and the wall.

<img alt="Docusaurus with Keytar" src={useBaseUrl('img/textured.png')} />
