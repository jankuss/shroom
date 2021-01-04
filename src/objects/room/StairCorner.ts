import * as PIXI from "pixi.js";
import { getTileColors } from "./util/getTileColors";
import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "./matrixes";
import { RoomObject } from "../RoomObject";
import { getZOrder } from "../../util/getZOrder";
import {
    getTilePositionForTile,
    TilePositionForTile,
} from "./util/getTilePositionForTile";
import { ITexturable } from "../../interfaces/ITextureable";
import { IRoomGeometry } from "../../interfaces/IRoomGeometry";

interface Props {
    geometry: IRoomGeometry;
    roomX: number;
    roomY: number;
    roomZ: number;
    tileHeight: number;
    color: string;
    type: 'front' | 'left' | 'right';
    texture?: PIXI.Texture;
}

export class StairCorner extends RoomObject implements ITexturable {
    private sprites: PIXI.DisplayObject[] = [];
    private container: PIXI.Container | undefined;

    private _texture: PIXI.Texture | undefined;
    private _color: string | undefined;

    private _tileHeight: number;

    public get tileHeight() {
        return this._tileHeight;
    }

    public set tileHeight(value) {
        this._tileHeight = value;
        this.updateSprites();
    }

    constructor(private props: Props) {
        super();

        this._texture = props.texture;
        this._tileHeight = props.tileHeight;
    }

    get texture() {
        return this._texture;
    }

    set texture(value) {
        this._texture = value;
        this.updateSprites();
    }

    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
        this.updateSprites();
    }

    updateSprites() {
        if (!this.mounted) return;

        this.container?.destroy();
        this.container = new PIXI.Container();

        const { roomX, roomY, roomZ, color, type } = this.props;
        this.container.zIndex = getZOrder(roomX, roomY, roomZ);
        this.container.sortableChildren = true

        const { x, y } = this.geometry.getPosition(roomX, roomY, roomZ);

        for (let i = 0; i < 4; i++) {
            const props = {
                x,
                y,
                tileHeight: this.tileHeight,
                index: 3 - i,
                color: this.color ?? color,
                tilePositions: getTilePositionForTile(roomX, roomY),
                texture: this.texture ?? PIXI.Texture.WHITE,
            };

            if (type === 'front') {
                this.container.addChild(...createStairBoxFront(props));
            } else if (type === 'left') {
                this.container.addChild(...createStairBoxLeft(props));
            } else if (type === 'right') {
                this.container.addChild(...createStairBoxRight(props));
            }
        }

        this.visualization.floorContainer.addChild(this.container);
    }

    destroySprites() {
        this.container?.destroy();
    }

    destroyed(): void {
        this.destroySprites();
    }

    registered(): void {
        this.updateSprites();
    }
}

const stairBase = 8;

interface StairBoxProps {
    x: number;
    y: number;
    index: number;
    tileHeight: number;
    color: string;
    tilePositions: TilePositionForTile;
    texture: PIXI.Texture;
}

function createStairBoxFront({
    x,
    y,
    tileHeight,
    index,
    color,
    tilePositions,
    texture,
}: StairBoxProps): PIXI.DisplayObject[] {
    const baseXLeft = x + stairBase * index;
    const baseYLeft = y - stairBase * index * 1.5;

    const baseXRight = x;
    const baseYRight = y - stairBase * index * 2;

    const { tileTint, borderRightTint, borderLeftTint } = getTileColors(color);

    function createSprite(
        matrix: PIXI.Matrix,
        tint: number,
        tilePosition: PIXI.Point
    ) {
        const tile = new PIXI.TilingSprite(texture);
        tile.tilePosition = tilePosition;
        tile.transform.setFromMatrix(matrix);

        tile.tint = tint;

        return tile;
    }

    const tileLeft = createSprite(
        getFloorMatrix(baseXLeft, baseYLeft),
        tileTint,
        tilePositions.top
    );

    tileLeft.width = 32 - (8 * index);
    tileLeft.height = 8;

    const tileRight = createSprite(
        getFloorMatrix(baseXRight + 32 - stairBase, baseYRight + stairBase * 1.5),
        tileTint,
        new PIXI.Point(0, 0)
    );

    tileRight.width = stairBase;
    tileRight.height = 32 - (8 * index);

    const borderLeft = createSprite(
        getLeftMatrix(baseXLeft - 8 * index, baseYLeft - 8 * index * .5, { width: 32, height: tileHeight }),
        borderLeftTint,
        tilePositions.left
    );
    borderLeft.width = 32 - (8 * index);
    borderLeft.height = tileHeight;

    const borderRight = createSprite(
        getRightMatrix(baseXRight - stairBase * index, y - stairBase * index * 1.5, { width: 32, height: tileHeight }),
        borderRightTint,
        tilePositions.right
    );

    borderRight.width = 32 - (8 * index);
    borderRight.height = tileHeight;

    return [borderLeft, borderRight, tileLeft, tileRight]
}

function createStairBoxLeft({
    x,
    y,
    tileHeight,
    index,
    color,
    tilePositions,
    texture,
}: StairBoxProps): PIXI.DisplayObject[] {
    const baseX = x - stairBase * index;
    const baseY = y - stairBase * index * 1.5;

    const { tileTint, borderRightTint } = getTileColors(color);

    function createSprite(
        matrix: PIXI.Matrix,
        tint: number,
        tilePosition: PIXI.Point
    ) {
        const tile = new PIXI.TilingSprite(texture);
        tile.tilePosition = tilePosition;
        tile.transform.setFromMatrix(matrix);

        tile.tint = tint;

        return tile;
    }

    const tileRight = createSprite(
        getFloorMatrix(baseX + 32 - stairBase, baseY + stairBase * 1.5),
        tileTint,
        tilePositions.top
    );

    tileRight.width = stairBase;
    tileRight.height = 32 - (8 * index);
    tileRight.zIndex = 2;

    const borderRight = createSprite(
        getRightMatrix(baseX - stairBase * index, y - stairBase * index, { width: 32, height: tileHeight }),
        borderRightTint,
        tilePositions.right
    );

    borderRight.width = 32 - (8 * index);
    borderRight.height = tileHeight;
    borderRight.zIndex = 1;

    if (index == 0) {
        const cornerOne = createSprite(
            getFloorMatrix(baseX + 40, y - 4),
            tileTint,
            tilePositions.right
        );

        cornerOne.width = 8;
        cornerOne.height = 8;
        cornerOne.zIndex = 0;

        const cornerTwo = createSprite(
            getFloorMatrix(baseX + 24, y - 12),
            tileTint,
            tilePositions.right
        );
        cornerTwo.width = 8;
        cornerTwo.height = 8;
        cornerTwo.zIndex = 0;

        return [tileRight, borderRight, cornerOne, cornerTwo]
    } else {
        return [tileRight, borderRight]
    }
}

function createStairBoxRight({
    x,
    y,
    tileHeight,
    index,
    color,
    tilePositions,
    texture,
}: StairBoxProps): PIXI.DisplayObject[] {
    const baseX = x + stairBase * index;
    const baseY = y - stairBase * index * 1.5;

    const { tileTint, borderRightTint, borderLeftTint } = getTileColors(color);

    function createSprite(
        matrix: PIXI.Matrix,
        tint: number,
        tilePosition: PIXI.Point
    ) {
        const tile = new PIXI.TilingSprite(texture);
        tile.tilePosition = tilePosition;
        tile.transform.setFromMatrix(matrix);

        tile.tint = tint;

        return tile;
    }

    const tile = createSprite(
        getFloorMatrix(baseX + 8 * index, baseY + 8 * index * .5),
        tileTint,
        tilePositions.top
    );

    tile.width = 32 - (8 * index);
    tile.height = 8;
    tile.zIndex = 2;

    const borderLeft = createSprite(
        getLeftMatrix(baseX, baseY, { width: 32, height: tileHeight }),
        borderLeftTint,
        tilePositions.left
    );
    borderLeft.width = 32 - (8 * index);
    borderLeft.height = tileHeight;
    borderLeft.zIndex = 1;

    if (index == 0) {
        const cornerOne = createSprite(
            getFloorMatrix(baseX + 8, y - 4),
            tileTint,
            tilePositions.right
        );

        cornerOne.width = 8;
        cornerOne.height = 8;
        cornerOne.zIndex = 0;

        const cornerTwo = createSprite(
            getFloorMatrix(baseX + 24, y - 12),
            tileTint,
            tilePositions.right
        );
        cornerTwo.width = 8;
        cornerTwo.height = 8;
        cornerTwo.zIndex = 0;

        return [tile, borderLeft, cornerOne, cornerTwo]
    } else {
        return [tile, borderLeft]
    }
}

export function createStairBoxDirection2({
    x,
    y,
    tileHeight,
    index,
    color,
    texture,
}: StairBoxProps) {
    const baseX = x - stairBase * index;
    const baseY = y - stairBase * index * 1.5;

    const { tileTint, borderRightTint, borderLeftTint } = getTileColors(color);

    function createSprite(matrix: PIXI.Matrix, tint: number) {
        const tile = new PIXI.TilingSprite(texture);
        tile.tilePosition = new PIXI.Point(0, 0);
        tile.transform.setFromMatrix(matrix);

        tile.tint = tint;

        return tile;
    }

    const tile = createSprite(
        getFloorMatrix(baseX + 32 - stairBase, baseY + stairBase * 1.5),
        tileTint
    );
    tile.width = stairBase;
    tile.height = 32;


    const borderLeft = createSprite(
        getLeftMatrix(baseX + 32 - stairBase, baseY + stairBase * 1.5, {
            width: stairBase,
            height: tileHeight,
        }),
        borderLeftTint
    );
    borderLeft.width = stairBase;
    borderLeft.height = tileHeight;

    const borderRight = createSprite(
        getRightMatrix(baseX, baseY, { width: 32, height: tileHeight }),
        borderRightTint
    );

    borderRight.width = 32;
    borderRight.height = tileHeight;

    return [borderLeft, borderRight, tile];
}
