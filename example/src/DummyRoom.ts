import {
  Avatar,
  Room,
  parseTileMapString,
  loadRoomTexture,
  FloorFurniture,
  FurnitureData,
  WallFurniture,
  Shroom,
} from "@jankuss/shroom";
import EasyStar from "easystarjs";
import { MultiStateBehavior } from "./behaviors/MultiStateBehavior";
import { DiceBehavior } from "./behaviors/DiceBehavior";
import { FurniInfoBehavior } from "./behaviors/FurniInfoBehavior";

export class DummyRoom {
  private room: Room;
  private ownAvatar: Avatar;
  private path: {
    roomX: number;
    roomY: number;
    roomZ: number;
    direction: number | undefined;
  }[] = [];
  private grid: number[][];
  private roomTick = setInterval(() => {
    const next = this.path[0];
    const afterNext = this.path[1];

    if (next != null) {
      this.ownAvatar.walk(next.roomX, next.roomY, next.roomZ, {
        direction: next.direction,
      });

      this.path.shift();
    }

    if (afterNext != null) {
      this.ownAvatar.walk(afterNext.roomX, afterNext.roomY, afterNext.roomZ, {
        direction: afterNext.direction,
      });

      this.path.shift();
    }
  }, 500);

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

    this.grid = tilemap.map((row) =>
      row.map((type) => (type !== "x" ? Number(type) : -1))
    );

    const furnitureData = FurnitureData.create("./resources");

    const shroom = Shroom.create({
      application,
      resourcePath: "./resources",
      furnitureData,
    });

    this.room = Room.create(shroom, {
      tilemap: tilemap,
    });

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 0,
        roomY: 0,
        roomZ: 1,
        direction: 0,
        type: "edicehc",
        behaviors: [new DiceBehavior(), new FurniInfoBehavior(furnitureData)],
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

    this.room.addRoomObject(
      new WallFurniture({
        roomX: 0,
        roomY: 0,
        roomZ: 1,
        direction: 2,
        type: "window_basic",
        animation: "0",
        behaviors: [new FurniInfoBehavior(furnitureData)],
      })
    );

    this.room.floorTexture = loadRoomTexture("./tile.png");

    this.room.onTileClick = async (position) => {
      this.ownAvatar.clearMovement();

      const path = await this.findPath(position);
      this.path = path;
    };

    this.ownAvatar = new Avatar({
      look: "hd-605-2.hr-3012-45.ch-645-109.lg-720-63.sh-725-92.wa-2001-62",
      direction: 2,
      roomX: 1,
      roomY: 0,
      roomZ: 1,
    });

    this.ownAvatar.onClick = (event) => {
      event.absorb();
    };

    this.room.addRoomObject(this.ownAvatar);

    this.room.x = application.screen.width / 2 - this.room.roomWidth / 2;
    this.room.y = application.screen.height / 2 - this.room.roomHeight / 2;

    application.stage.addChild(this.room);
  }

  private handleRoomTick() {}

  private findPath(target: { roomX: number; roomY: number }) {
    return new Promise<
      {
        roomX: number;
        roomY: number;
        roomZ: number;
        direction: number | undefined;
      }[]
    >((resolve) => {
      const easystar = new EasyStar.js();

      easystar.setGrid(this.grid);
      easystar.setAcceptableTiles([1, 0]);
      easystar.enableDiagonals();

      easystar.findPath(
        this.ownAvatar.roomX,
        this.ownAvatar.roomY,
        target.roomX,
        target.roomY,
        (result) => {
          let currentPosition = {
            x: this.ownAvatar.roomX,
            y: this.ownAvatar.roomY,
          };

          const path: {
            roomX: number;
            roomY: number;
            roomZ: number;
            direction: number | undefined;
          }[] = [];

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

              path.push({
                roomX: position.x,
                roomY: position.y,
                roomZ: getHeight(),
                direction,
              });

              currentPosition = {
                x: position.x,
                y: position.y,
              };
            }
          });

          resolve(path);
        }
      );

      easystar.calculate();
    });
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
