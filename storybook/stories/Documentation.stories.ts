import {
  FloorFurniture,
  Room,
  IFurniture,
  Avatar,
  AvatarAction,
  BaseAvatar,
  BaseFurniture,
} from "@jankuss/shroom";
import { createShroom } from "./common/createShroom";

export default {
  title: "Documentation",
};

export function ImplementingFurnitureLogic() {
  return createShroom(({ application, shroom }) => {
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
      type: "edicehc",
    });

    const handleDice = (furniture: IFurniture) => {
      interface State {
        rolling: boolean;
        value: number;
        active: boolean;
      }

      let state: State = { rolling: false, value: 1, active: false };
      let timeout: number;

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
        timeout = window.setTimeout(() => {
          updateState({
            ...state,
            rolling: false,
            value: Math.floor(Math.random() * 6) + 1,
          });
        }, 1000);
      };

      const deactivate = () => {
        updateState({ ...state, rolling: false, active: !state.active });
        if (state.active) {
          roll();
        }
      };

      furniture.onDoubleClick = (event) => {
        console.log("EVENT TAG", event.tag);

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

    application.stage.addChild(room);
  });
}

export function AvatarActions() {
  return createShroom(({ application, shroom }) => {
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
      avatar.removeAction(AvatarAction.Sit);
    }, 5000);

    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function BaseAvatarAndFurniture() {
  return createShroom(({ application, shroom }) => {
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
  });
}
