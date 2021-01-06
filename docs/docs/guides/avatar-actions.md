---
id: avatar-actions
title: Avatar actions
---

Avatars can have multiple different actions. Here is how you add and remove actions from avatars.

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

const avatar = new Avatar({
  roomX: 1,
  roomY: 1,
  roomZ: 0,
  direction: 2,
  look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
});

avatar.addAction(AvatarAction.GestureSmile);
avatar.addAction(AvatarAction.Respect);
avatar.addAction(AvatarAction.Sit);
avatar.addAction(AvatarAction.CarryItem);
avatar.item = 1;

setTimeout(() => {
  // Remove the sitting action after some time passed
  avatar.removeAction(AvatarAction.Sit);
}, 5000);

room.addRoomObject(avatar);

application.stage.addChild(room);
```
