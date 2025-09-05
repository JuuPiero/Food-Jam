import { _decorator, Component, instantiate, Layers, Node } from 'cc';
import { IItemsLayerData, IShelfData } from '../Data/ILevelData';
import { Shelf } from './Shelf';
import { SlotContainer } from './Layer/SlotContainer';
const { ccclass, property } = _decorator;

@ccclass("NormalShelf")
export class NormalShelf extends Shelf {
    
    protected completeShelf(): void {
        this.shelfCleared();
    }
}


