export interface ILevelData {
    numberCellLock: number;
    maxUniqueColors: number;
    cells: IShelfData[];
}

export interface IShelfData {
    posX: number;
    posY: number;
    cellType: EShelfType;
    moveType: EMoveType;
    speed: number;
    itemsLayer: IItemsLayerData[];
}

export interface IItemsLayerData {
    items: number[];
}

export enum EMoveType {
    NONE,
    FALLING,
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
    BOTTOM_TO_TOP,
    TOP_TO_BOTTOM
}

export enum EShelfType {
    NORMAL,
    MOVE,
    SINGLE,
    SINGLE_MOVE,
}