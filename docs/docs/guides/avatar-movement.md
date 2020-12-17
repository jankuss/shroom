---
id: avatar-movement
title: Avatar/Furniture movement animation
---

## Moving Avatars

To make an avatar move in a room, there are the following methods.

- `avatar.walk(roomX, roomY, roomZ, { direction: 2 })` to make the avatar walk with the walking animation to the specified position.
- `avatar.move(roomX, roomY, roomZ)` to make the avatar just slide to the specified position.

Walk usually should be used for user initiated navigation, while move should be used when external forces are acting on the user (i.e. roller or wired). But do whatever you like.

Please note with both those methods, you will need to implement your own pathfinding solution. Both of these methods just handle animating the positional change of the avatar.

```ts
import * as PIXI from "pixi.js";

import { Room, Avatar, Shroom } from "@jankuss/shroom";

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

const avatar = new Avatar({
  look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
  direction: 2,
  roomX: 0,
  roomY: 1,
  roomZ: 0,
});

room.x = 100;
room.y = 200;
room.onTileClick = (position) => {
  console.log("Send this probably to a server somewhere", position);
};

setTimeout(() => {
  // Small delay here so we can witness the avatar moving.

  avatar.walk(0, 2, 0, { direction: 4 });
  avatar.move(1, 2, 0);
}, 3000);

room.addRoomObject(avatar);

application.stage.addChild(room);
```

## Animation Queueing

Movement animations get queued and executed in order. In the above example, this means that `walk` executes first, and after the walk animation is done `move` will be executed instantly after.

This behavior is there to make it easy to create smooth walking/movement across multiple tiles.

To remove movement commands in that queue, there is a method on movable objects called `clearMovement()`.

```ts
avatar.clearMovement();
```

This removes all queued animations and let's the present animation finish.

## Moving furniture

Moving furniture is almost the same as with the avatar. Note here, that only `FloorFurniture` is able to animate.
The only difference to the `Avatar` is, that furniture can't walk (please let me know if they can).

```ts
const furniture = new FloorFurniture({
  roomX: 0,
  roomY: 0,
  roomZ: 0,
  direction: 2,
  type: "club_sofa",
  animation: "0",
});

furniture.move(0, 1, 0);
```
