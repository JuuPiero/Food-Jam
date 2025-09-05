import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { Shelf } from '../Shelf/Shelf';
import { State } from './State/State';
import { GoodsState } from '../Goods/GoodsState';
import { EGoodsState } from '../Goods/Goods';
import { Slot } from '../Slot/Slot';
const { ccclass, property } = _decorator;

@ccclass('GoodsBase')
export abstract class GoodsBase extends State<EGoodsState, GoodsState>  {
    
    protected _goodsId: number = 0;
    public shelf: Shelf = null;
    public slot: Slot = null;
    public abstract initialize(id: number, spriteFrame: SpriteFrame): void;
    public abstract onClick(): void;
    public abstract reset(): void;
    public abstract pickUp(): void;
    public abstract getId(): number;
    
}


