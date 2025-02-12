import { _decorator, Component, instantiate, Layers, Node } from 'cc';
import { IItemsLayerData, IShelfData } from '../Data/ILevelData';
import { Shelf } from './Shelf';
import { ShelfLayer } from './Layer/ShelfLayer';
const { ccclass, property } = _decorator;

@ccclass("NormalShelf")
export class NormalShelf extends Shelf {
    
}


