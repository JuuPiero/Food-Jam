import { _decorator, Component, Node } from 'cc';
import { IShelfData } from '../Data/ILevelData';
const { ccclass, property } = _decorator;

@ccclass('IShelf')
export abstract class IShelf extends Component {
    
    public abstract initialize(data: IShelfData): void;
    public abstract reset(): void;
}


