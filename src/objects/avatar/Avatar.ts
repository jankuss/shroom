import { RoomObject } from "../../RoomObject";
import * as PIXI from "pixi.js";
import { AvatarLoaderResult } from "../../IAvatarLoader";
import { AvatarDrawPart } from "./util/getAvatarDrawDefinition";
import { getZOrder } from "../../util/getZOrder";

export class Avatar extends RoomObject {
  private container: PIXI.Container | undefined;
  private sprites: PIXI.Sprite[] = [];
  private avatarLoaderResult: AvatarLoaderResult | undefined;

  constructor(
    private look: string,
    private action: string,
    private direction: number,
    private position: { roomX: number; roomY: number; roomZ: number }
  ) {
    super();
  }

  private updateSprites() {
    if (this.avatarLoaderResult == null) return;

    const { x, y } = this.geometry.getPosition(
      this.position.roomX,
      this.position.roomY,
      this.position.roomZ
    );
    this.container?.destroy();

    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y + 16;
    this.container.zIndex =
      getZOrder(this.position.roomX, this.position.roomY, this.position.roomZ) +
      1;

    const definition = this.avatarLoaderResult.getDrawDefinition(
      this.look,
      this.direction,
      this.action
    );

    definition.parts.forEach((part) => {
      this.container?.addChild(this.createAsset(part));
    });

    this.visualization.addContainerChild(this.container);
  }

  private createAsset(part: AvatarDrawPart) {
    if (this.avatarLoaderResult == null)
      throw new Error(
        "Cant create asset when avatar loader result not present"
      );
    const texture = this.avatarLoaderResult.getTexture(part.fileId);

    if (texture == null) throw new Error("Invalid texture");

    const sprite = new PIXI.Sprite();
    sprite.texture = texture;

    sprite.x = part.x;
    sprite.y = part.y;

    if (part.color != null && part.mode === "colored") {
      sprite.tint = parseInt(part.color.slice(1), 16);
    }

    return sprite;
  }

  registered(): void {
    this.avatarLoader.getAvatarDrawDefinition(this.look).then((result) => {
      this.avatarLoaderResult = result;
      this.updateSprites();
    });

    this.updateSprites();
  }
  destroy(): void {}
}
