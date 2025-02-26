import { _decorator, Component, Node } from 'cc';
import { Shelf } from './Shelf';
const { ccclass, property } = _decorator;

@ccclass('SingleShelf')
export class SingleShelf extends Shelf {
    
    protected completeShelf(): void {
        // Chả có gì làm cả.
    }
}


