import { Avatar, Room, parseTileMapString } from "shroom";
import EasyStar from "easystarjs";

export class ConnectedRoom {
  private room: Room;
  private ownAvatar: Avatar;

  constructor(application: PIXI.Application) {
    const tilemap = parseTileMapString(`
        1111111111
        1111111111
        11111x1111
        11111x0000
        11111x0000
        11111x0000
        00000x0000
        0000000000
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

    this.room.onTileClick = (position) => {
      const easystar = new EasyStar.js();

      console.log(
        "EasyStar",
        this.ownAvatar.roomX,
        this.ownAvatar.roomY,
        position
      );

      easystar.setGrid(grid);
      easystar.setAcceptableTiles([1, 0]);

      easystar.findPath(
        this.ownAvatar.roomX,
        this.ownAvatar.roomY,
        position.roomX,
        position.roomY,
        (result) => {
          result.forEach((position, index) => {
            if (index === 0) return;

            this.ownAvatar.walk(
              position.x,
              position.y,
              Number(tilemap[position.y][position.x])
            );
          });
        }
      );

      easystar.calculate();
    };

    this.ownAvatar = new Avatar({
      look: "hd-605-2.hr-3012-45.ch-645-109.lg-720-63.sh-725-92.wa-2001-62",
      direction: 2,
      roomX: 0,
      roomY: 0,
      roomZ: 1,
    });

    this.room.addRoomObject(this.ownAvatar);

    this.room.x = application.screen.width / 2 - this.room.roomWidth / 2;
    this.room.y = application.screen.height / 2 - this.room.roomHeight / 2;

    application.stage.addChild(this.room);
  }
}
