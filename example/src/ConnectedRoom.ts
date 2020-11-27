import {
  Avatar,
  Room,
  parseTileMapString,
  loadRoomTexture,
  FloorFurniture,
} from "shroom";
import EasyStar from "easystarjs";
import { DiceBehavior } from "./DiceBehavior";
import { MultiStateBehavior } from "./MultiStateBehavior";

export class ConnectedRoom {
  private room: Room;
  private ownAvatar: Avatar;

  constructor(application: PIXI.Application) {
    const tilemap = parseTileMapString(`
        1111111111
        1111111111
        1111111111
        1111111111
        111111xx00
        111111xx00
        000000xx00
        0000000000
        0000000000
        0000000000
    `);

    const grid = tilemap.map((row) =>
      row.map((type) => (type !== "x" ? Number(type) : -1))
    );

    this.room = Room.create({
      application,
      tilemap: tilemap,
      resourcePath: ".",
    });

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 0,
        roomY: 0,
        roomZ: 1,
        direction: 0,
        type: "edicehc",
        behaviors: [new DiceBehavior()],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 0,
        roomY: 0,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "0",
        behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 2,
        roomY: 0,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 4,
        roomY: 0,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 6,
        roomY: 0,
        roomZ: 1,
        direction: 6,
        type: "party_floor",
        animation: "1",
        behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 8,
        roomY: 0,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 8,
        roomY: 2,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 6,
        roomY: 2,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 0,
        roomY: 2,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 2,
        roomY: 2,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 4,
        roomY: 2,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 0,
        roomY: 4,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 2,
        roomY: 4,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 4,
        roomY: 4,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 0,
        roomY: 1,
        roomZ: 1,
        direction: 0,
        type: "throne",
        animation: "0",
        behaviors: [],
      })
    );

    //

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 1,
        roomY: 0,
        roomZ: 1,
        direction: 2,
        type: "party_ravel",
        animation: "0",
        behaviors: [new MultiStateBehavior({ initialState: 0, count: 2 })],
      })
    );

    this.room.floorTexture = loadRoomTexture("./tile.png");

    this.room.onTileClick = (position) => {
      const easystar = new EasyStar.js();

      easystar.setGrid(grid);
      easystar.setAcceptableTiles([1, 0]);
      easystar.enableDiagonals();

      easystar.findPath(
        this.ownAvatar.roomX,
        this.ownAvatar.roomY,
        position.roomX,
        position.roomY,
        (result) => {
          let currentPosition = {
            x: this.ownAvatar.roomX,
            y: this.ownAvatar.roomY,
          };

          result.forEach((position, index) => {
            if (index === 0) return;

            const direction = getAvatarDirectionFromDiff(
              position.x - currentPosition.x,
              position.y - currentPosition.y
            );

            const tile = this.room.getTileAtPosition(position.x, position.y);

            if (tile != null) {
              const getHeight = () => {
                if (tile.type === "tile") return tile.z;
                if (tile.type === "stairs") return tile.z + 0.5;

                return 0;
              };

              this.ownAvatar.walk(position.x, position.y, getHeight(), {
                direction,
              });

              currentPosition = {
                x: position.x,
                y: position.y,
              };
            }
          });
        }
      );

      easystar.calculate();
    };

    this.ownAvatar = new Avatar({
      look: "hd-605-2.hr-3012-45.ch-645-109.lg-720-63.sh-725-92.wa-2001-62",
      direction: 2,
      roomX: 1,
      roomY: 0,
      roomZ: 1,
    });

    this.room.addRoomObject(this.ownAvatar);

    this.room.x = application.screen.width / 2 - this.room.roomWidth / 2;
    this.room.y = application.screen.height / 2 - this.room.roomHeight / 2;

    application.stage.addChild(this.room);
  }
}

function getAvatarDirectionFromDiff(diffX: number, diffY: number) {
  const signX = Math.sign(diffX) as -1 | 0 | 1;
  const signY = Math.sign(diffY) as -1 | 0 | 1;

  switch (signX) {
    case -1:
      switch (signY) {
        case -1:
          return 7;
        case 0:
          return 6;
        case 1:
          return 5;
      }
      break;

    case 0:
      switch (signY) {
        case -1:
          return 0;
        case 1:
          return 4;
      }
      break;

    case 1:
      switch (signY) {
        case -1:
          return 1;
        case 0:
          return 2;
        case 1:
          return 3;
      }
      break;
  }
}
