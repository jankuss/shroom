import { Avatar, AvatarAction, Room, BaseAvatar } from "@jankuss/shroom";
import { createShroom } from "./common/createShroom";
import { action } from "@storybook/addon-actions";

export default {
  title: "Avatar",
};

export function Default() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
            xxxxxxxxxxxxxxxx
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
          `,
    });

    const looks: string[] = [
      "ch-255-91.lg-280-64.sh-290-1408.hd-180-2.hr-831-61",
      "hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61",
      "hd-190-1.hr-3163-1356.he-3081-62.fa-1203-62.cc-3153-1336.lg-3058-110",
    ];

    /*
    for (let y = 1; y < 6; y++) {
      for (let x = 0; x < 8; x++) {
        const avatar = new Avatar({
          look: "ch-255-91.lg-280-64.sh-290-1408.hd-180-2.hr-831-61",
          direction: x % 8,
          roomX: 1 + x * 2,
          roomY: y * 2,
          roomZ: 0,
        });

        avatar.addAction(AvatarAction.Respect);

        room.addRoomObject(avatar);
      }
    }*/

    const avatars: Avatar[] = [];

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 8; x++) {
        const avatar = new Avatar({
          look: looks[y % looks.length],
          direction: y % 8,
          roomX: 1 + x * 2,
          roomY: 1 + y * 2,
          roomZ: 0,
        });
        avatar.addAction(AvatarAction.CarryItem);
        avatar.item = 2;

        room.addRoomObject(avatar);
        avatars.push(avatar);
      }
    }

    setInterval(() => {
      avatars.forEach((avatar) => {
        if (!avatar.hasAction(AvatarAction.UseItem)) {
          avatar.addAction(AvatarAction.UseItem);
        } else {
          avatar.removeAction(AvatarAction.UseItem);
        }
      });
    }, 1000);

    application.stage.addChild(room);
  });
}

export function Walking() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
           xxxxxxxx
           x0000000
           x0000000
           x0000000
           x0000000
          `,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 4,
      roomX: 1,
      roomY: 1,
      roomZ: 0,
    });

    setTimeout(() => {
      avatar.walk(1, 2, 0, { direction: 4 });
      avatar.walk(2, 2, 0, { direction: 2 });
      avatar.walk(3, 2, 0, { direction: 2 });
      avatar.walk(4, 2, 0);
      avatar.walk(4, 3, 0, { direction: 4, headDirection: 5 });
    }, 3000);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function Drinking() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
            xxxxxxxx
            x0000000
            x0000000
            x0000000
            x0000000
          `,
    });

    const avatars: Avatar[] = [];

    for (let i = 0; i < 4; i++) {
      const avatar = new Avatar({
        look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
        direction: i * 2,
        roomX: 1 + i * 2,
        roomY: 1,
        roomZ: 0,
      });

      avatar.item = 1;
      avatar.addAction(AvatarAction.CarryItem);

      room.addRoomObject(avatar);
      avatars.push(avatar);
    }

    for (let i = 0; i < 4; i++) {
      const avatar = new Avatar({
        look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
        direction: i * 2 + 1,
        roomX: 1 + i * 2,
        roomY: 1 + 3,
        roomZ: 0,
      });

      avatar.item = 2;
      avatar.addAction(AvatarAction.UseItem);

      room.addRoomObject(avatar);
      avatars.push(avatar);
    }

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}

export function AvatarInDoor() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
           xxxxxxxx
           x0000000
           x0000000
           00000000
           x0000000
          `,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 2,
      roomX: 0,
      roomY: 3,
      roomZ: 0,
    });

    setTimeout(() => {
      avatar.walk(1, 3, 0, { direction: 2 });
    }, 3000);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function AvatarHairBack() {
  return createShroom(({ application, shroom }) => {
    const look = `hd-180-1.hr-831-61.ha-1012-68.ch-215-66.lg-280-110.sh-305-62`;

    const room = Room.create(shroom, {
      tilemap: `
           xxxxxxxx
           x0000000
           x0000000
           00000000
           x0000000
          `,
    });

    const avatar = new Avatar({
      look: look,
      direction: 0,
      roomX: 4,
      roomY: 4,
      roomZ: 0,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function AvatarPlain() {
  return createShroom(({ application, shroom }) => {
    const look = `hd-99999-99999`;

    const room = Room.create(shroom, {
      tilemap: `
           xxxxxxxx
           x0000000
           x0000000
           00000000
           x0000000
          `,
    });

    const avatar = new Avatar({
      look: look,
      direction: 2,
      roomX: 4,
      roomY: 4,
      roomZ: 0,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function EventHandling() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
           xxxxxxxx
           x0000000
           x0000000
           x0000000
           x0000000
          `,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 4,
      roomX: 1,
      roomY: 1,
      roomZ: 0,
    });

    avatar.onClick = action("Click");
    avatar.onDoubleClick = action("Double Click");

    setTimeout(() => {
      avatar.walk(1, 2, 0, { direction: 4 });
      avatar.walk(2, 2, 0, { direction: 2 });
      avatar.walk(3, 2, 0, { direction: 2 });
    }, 3000);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function headRotation() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
           xxxxxxxx
           x0000000
           x0000000
           x0000000
           x0000000
          `,
    });

    const avatar = new Avatar({
      look:
        "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.fa-1204-62.ch-255-66.lg-280-110.sh-305-62",
      direction: 5,
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      headDirection: 5,
    });

    // const avatar2 = new Avatar({
    //   look: "hr-3163-39.hd-180-2.lg-3202-1322.ch-215-1331",
    //   direction: 4,
    //   roomX: 2,
    //   roomY: 2,
    //   roomZ: 0,
    //   headDirection: 2
    // });
    // const avatar3 = new Avatar({
    //   look: "hr-3163-39.hd-180-2.lg-3202-1322.ch-215-1331",
    //   direction: 3,
    //   roomX: 3,
    //   roomY: 3,
    //   roomZ: 0,
    //   headDirection: 1
    // });
    // const avatar4 = new Avatar({
    //   look: "hr-3163-39.hd-180-2.lg-3202-1322.ch-215-1331",
    //   direction: 3,
    //   roomX: 4,
    //   roomY: 4,
    //   roomZ: 0,
    //   headDirection: 0
    // });

    avatar.onClick = action("Click");
    avatar.onDoubleClick = action("Double Click");

    setInterval(() => {
      if (avatar.headDirection !== undefined) {
        avatar.headDirection = undefined;
      } else {
        avatar.headDirection = 0;
      }
      // avatar.headDirection++;
      // if (avatar.headDirection > 7) {
      //   avatar.headDirection = 0;
      // }
    }, 3000);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(avatar);
    // room.addRoomObject(avatar2);
    // room.addRoomObject(avatar3);
    // room.addRoomObject(avatar4);

    application.stage.addChild(room);
  });
}

export function BaseAvatarClothes() {
  return createShroom(({ application, shroom }) => {
    const baseAvatar = BaseAvatar.fromShroom(shroom, {
      look: {
        look: "ch-3001-73",
        direction: 2,
        actions: new Set<AvatarAction>(),
      },
      zIndex: 1,
      skipCaching: true,
      skipBodyParts: true,
      position: {
        x: 0,
        y: 32,
      },
      onLoad: () => {
        // console.log(baseAvatar.width, baseAvatar.height)
      },
    });

    const baseAvatar2 = BaseAvatar.fromShroom(shroom, {
      look: {
        look: "hr-3163-39.hd-180-2.lg-3202-1322.ch-215-1331",
        direction: 3,
        actions: new Set<AvatarAction>(),
      },
      zIndex: 1,
      headOnly: true,
      skipCaching: true,
      position: {
        x: 100,
        y: 200,
      },
      onLoad: () => {
        console.log(baseAvatar2.width, baseAvatar2.height);
      },
    });

    application.stage.addChild(baseAvatar);
    application.stage.addChild(baseAvatar2);
  });
}

export function BaseAvatarBroke() {
  return createShroom(({ application, shroom }) => {
    const avatar1 = BaseAvatar.fromShroom(shroom, {
      look: {
        look: "hr-3163-39.hd-180-2.lg-3202-1322-1329.ch-215-1331",
        actions: new Set<AvatarAction>().add(AvatarAction.GestureSmile),
        direction: 3,
      },
      position: {
        x: 0,
        y: 150,
      },
      zIndex: 0,
      onLoad: () => {},
    });
    const avatar2 = BaseAvatar.fromShroom(shroom, {
      look: {
        look: "lg-3202-1322-1329.hr-3163-39.ch-215-93.ha-1009-93.hd-180-2",
        actions: new Set<AvatarAction>().add(AvatarAction.GestureSmile),
        direction: 3,
      },
      position: {
        x: 100,
        y: 150,
      },
      zIndex: 0,
      onLoad: () => {
        //
      },
    });
    const avatar3 = BaseAvatar.fromShroom(shroom, {
      look: {
        look: "hr-3163-39.hd-180-2.lg-3202-1322-1329.ch-215-1331",
        actions: new Set<AvatarAction>().add(AvatarAction.GestureSmile),
        direction: 3,
      },
      position: {
        x: 200,
        y: 150,
      },
      zIndex: 0,
      onLoad: () => {
        avatar3.lookOptions = {
          look: "lg-3202-1322-1329.hr-3163-39.ch-215-93.ha-1009-93.hd-180-2",
          actions: new Set<AvatarAction>().add(AvatarAction.GestureSmile),
          direction: 3,
        };
      },
    });
    const avatar4 = BaseAvatar.fromShroom(shroom, {
      look: {
        look: "lg-3202-1322-1329.hr-3163-39.ch-215-93.ha-1009-93.hd-180-2",
        actions: new Set<AvatarAction>().add(AvatarAction.GestureSmile),
        direction: 3,
      },
      position: {
        x: 200,
        y: 250,
      },
      zIndex: 0,
      onLoad: () => {
        avatar4.lookOptions = {
          look: "hr-3163-39.hd-180-2.lg-3202-1322-1329.ch-215-1331",
          actions: new Set<AvatarAction>().add(AvatarAction.GestureSmile),
          direction: 3,
        };
      },
    });

    application.stage.addChild(avatar1);
    application.stage.addChild(avatar2);
    application.stage.addChild(avatar3);
    application.stage.addChild(avatar4);
  });
}

export function AvatarDestroy() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
           xxxxxxxx
           x0000000
           x0000000
           x0000000
           x0000000
          `,
    });

    const avatar = new Avatar({
      look:
        "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.fa-1204-62.ch-255-66.lg-280-110.sh-305-62",
      direction: 3,
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      headDirection: 5,
    });

    setTimeout(() => {
      avatar.addAction(AvatarAction.Respect);
    }, 3000);

    setTimeout(() => {
      avatar.destroy();
    }, 6000);

    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}
