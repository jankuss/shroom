import { Room } from "@jankuss/shroom";
import { createShroom } from "./common/createShroom";

export default {
  title: "Room / Model",
};

export function RoomModelA() {
  return renderRoomModel(`
    xxxxxxxxxxxx
    xxxx00000000
    xxxx00000000
    xxxx00000000
    xxxx00000000
    xxx000000000
    xxxx00000000
    xxxx00000000
    xxxx00000000
    xxxx00000000
    xxxx00000000
    xxxx00000000
    xxxx00000000
    xxxx00000000
    xxxxxxxxxxxx
    xxxxxxxxxxxx`);
}

export function RoomModelB() {
  return renderRoomModel(`
    xxxxxxxxxxxx
    xxxxx0000000
    xxxxx0000000
    xxxxx0000000
    xxxxx0000000
    000000000000
    x00000000000
    x00000000000
    x00000000000
    x00000000000
    x00000000000
    xxxxxxxxxxxx
    xxxxxxxxxxxx
    xxxxxxxxxxxx
    xxxxxxxxxxxx
    xxxxxxxxxxxx`);
}

export function RoomModelC() {
  return renderRoomModel(`
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxx000000x
        xxxxx000000x
        xxxx0000000x
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx`);
}

export function RoomModelD() {
  return renderRoomModel(`
        xxxxxxxxxxxx
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxx0000000x
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxxxxxxxxxx`);
}

export function RoomModelE() {
  return renderRoomModel(`
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xx0000000000
        xx0000000000
        x00000000000
        xx0000000000
        xx0000000000
        xx0000000000
        xx0000000000
        xx0000000000
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx`);
}

export function RoomModelF() {
  return renderRoomModel(`
        xxxxxxxxxxxx
        xxxxxxx0000x
        xxxxxxx0000x
        xxx00000000x
        xxx00000000x
        xx000000000x
        xxx00000000x
        x0000000000x
        x0000000000x
        x0000000000x
        x0000000000x
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx`);
}

export function RoomModelG() {
  return renderRoomModel(`
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxx00000
        xxxxxxx00000
        xxxxxxx00000
        xx1111000000
        xx1111000000
        x11111000000
        xx1111000000
        xx1111000000
        xxxxxxx00000
        xxxxxxx00000
        xxxxxxx00000
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx`);
}

export function RoomModelH() {
  return renderRoomModel(`
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxx111111x
        xxxxx111111x
        xxxx1111111x
        xxxxx111111x
        xxxxx111111x
        xxxxx000000x
        xxxxx000000x
        xxx00000000x
        xxx00000000x
        xxx00000000x
        xxx00000000x
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx`);
}

export function RoomModelI() {
  return renderRoomModel(`
        xxxxxxxxxxxxxxxxx
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        00000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        x0000000000000000
        xxxxxxxxxxxxxxxxx`);
}

export function RoomModelJ() {
  return renderRoomModel(`
        xxxxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxx0000000000
        xxxxxxxxxxx0000000000
        xxxxxxxxxxx0000000000
        xxxxxxxxxxx0000000000
        xxxxxxxxxxx0000000000
        xxxxxxxxxxx0000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        000000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x0000000000xxxxxxxxxx
        x0000000000xxxxxxxxxx
        x0000000000xxxxxxxxxx
        x0000000000xxxxxxxxxx
        x0000000000xxxxxxxxxx
        x0000000000xxxxxxxxxx
        xxxxxxxxxxxxxxxxxxxxx`);
}

export function RoomModelK() {
  return renderRoomModel(`
        xxxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxxxxxxxx00000000
        xxxxxxxxxxxxxxxxx00000000
        xxxxxxxxxxxxxxxxx00000000
        xxxxxxxxxxxxxxxxx00000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        x000000000000000000000000
        x000000000000000000000000
        x000000000000000000000000
        x000000000000000000000000
        0000000000000000000000000
        x000000000000000000000000
        x000000000000000000000000
        x000000000000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxxxxxxxxxxxxxxxxxx`);
}

export function RoomModelL() {
  return renderRoomModel(`
        xxxxxxxxxxxxxxxxxxxxx
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000xxxx00000000
        x00000000xxxx00000000
        x00000000xxxx00000000
        x00000000xxxx00000000
        x00000000xxxx00000000
        x00000000xxxx00000000
        x00000000xxxx00000000
        000000000xxxx00000000
        x00000000xxxx00000000
        x00000000xxxx00000000
        x00000000xxxx00000000
        x00000000xxxx00000000
        xxxxxxxxxxxxxxxxxxxxx`);
}

export function RoomModelM() {
  return renderRoomModel(`
        xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        x0000000000000000000000000000
        x0000000000000000000000000000
        x0000000000000000000000000000
        x0000000000000000000000000000
        00000000000000000000000000000
        x0000000000000000000000000000
        x0000000000000000000000000000
        x0000000000000000000000000000
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxx00000000xxxxxxxxxx
        xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`);
}

export function RoomModelN() {
  return renderRoomModel(`
        xxxxxxxxxxxxxxxxxxxxx
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x000000xxxxxxxx000000
        x000000x000000x000000
        x000000x000000x000000
        x000000x000000x000000
        x000000x000000x000000
        x000000x000000x000000
        x000000x000000x000000
        x000000xxxxxxxx000000
        x00000000000000000000
        000000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        x00000000000000000000
        xxxxxxxxxxxxxxxxxxxxx`);
}

export function RoomModelO() {
  return renderRoomModel(`
        xxxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxxxx11111111xxxx
        xxxxxxxxxxxxx11111111xxxx
        xxxxxxxxxxxxx11111111xxxx
        xxxxxxxxxxxxx11111111xxxx
        xxxxxxxxxxxxx11111111xxxx
        xxxxxxxxxxxxx11111111xxxx
        xxxxxxxxxxxxx11111111xxxx
        xxxxxxxxxxxxx00000000xxxx
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        x111111100000000000000000
        x111111100000000000000000
        x111111100000000000000000
        1111111100000000000000000
        x111111100000000000000000
        x111111100000000000000000
        x111111100000000000000000
        x111111100000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxx0000000000000000
        xxxxxxxxxxxxxxxxxxxxxxxxx`);
}

export function RoomModelP() {
  return renderRoomModel(`
        xxxxxxxxxxxxxxxxxxx
        xxxxxxx222222222222
        xxxxxxx222222222222
        xxxxxxx222222222222
        xxxxxxx222222222222
        xxxxxxx222222222222
        xxxxxxx222222222222
        xxxxxxx22222222xxxx
        xxxxxxx11111111xxxx
        x222221111111111111
        x222221111111111111
        x222221111111111111
        x222221111111111111
        x222221111111111111
        x222221111111111111
        x222221111111111111
        x222221111111111111
        x2222xx11111111xxxx
        x2222xx00000000xxxx
        x2222xx000000000000
        x2222xx000000000000
        x2222xx000000000000
        x2222xx000000000000
        22222xx000000000000
        x2222xx000000000000
        xxxxxxxxxxxxxxxxxxx`);
}

export function RoomModelQ() {
  return renderRoomModel(`
        xxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxx22222222
        xxxxxxxxxxx22222222
        xxxxxxxxxxx22222222
        xxxxxxxxxx222222222
        xxxxxxxxxxx22222222
        xxxxxxxxxxx22222222
        x222222222222222222
        x222222222222222222
        x222222222222222222
        x222222222222222222
        x222222222222222222
        x222222222222222222
        x2222xxxxxxxxxxxxxx
        x2222xxxxxxxxxxxxxx
        x2222211111xx000000
        x222221111110000000
        x222221111110000000
        x2222211111xx000000
        xx22xxx1111xxxxxxxx
        xx11xxx1111xxxxxxxx
        x1111xx1111xx000000
        x1111xx111110000000
        x1111xx111110000000
        x1111xx1111xx000000
        xxxxxxxxxxxxxxxxxxx`);
}

export function RoomModelR() {
  return renderRoomModel(`
        xxxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxx33333333333333
        xxxxxxxxxxx33333333333333
        xxxxxxxxxxx33333333333333
        xxxxxxxxxx333333333333333
        xxxxxxxxxxx33333333333333
        xxxxxxxxxxx33333333333333
        xxxxxxx333333333333333333
        xxxxxxx333333333333333333
        xxxxxxx333333333333333333
        xxxxxxx333333333333333333
        xxxxxxx333333333333333333
        xxxxxxx333333333333333333
        x4444433333xxxxxxxxxxxxxx
        x4444433333xxxxxxxxxxxxxx
        x44444333333222xx000000xx
        x44444333333222xx000000xx
        xxx44xxxxxxxx22xx000000xx
        xxx33xxxxxxxx11xx000000xx
        xxx33322222211110000000xx
        xxx33322222211110000000xx
        xxxxxxxxxxxxxxxxx000000xx
        xxxxxxxxxxxxxxxxx000000xx
        xxxxxxxxxxxxxxxxx000000xx
        xxxxxxxxxxxxxxxxx000000xx
        xxxxxxxxxxxxxxxxxxxxxxxxx`);
}

function renderRoomModel(tilemap: string) {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap,
    });

    application.stage.addChild(room);
  });
}
