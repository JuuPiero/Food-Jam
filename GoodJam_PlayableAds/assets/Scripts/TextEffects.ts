import { _decorator, Component, instantiate, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { Random } from './Modules/Random';
const { ccclass, property } = _decorator;

@ccclass('TextEffects')
export class TextEffects extends Component {

    @property(Prefab)
    prefabTextEffect: Prefab = null;

    @property([SpriteFrame])
    spfrTextEffects: SpriteFrame[] = [];

    private static _instance: TextEffects = null;
    public static get Instance(): TextEffects {
        return TextEffects._instance;
    }

    protected onLoad(): void {
        TextEffects._instance = this;
    }
    
    public show(index: number): void {
        if (index === null || index === undefined) {
            index = Random.getRandomInt(0, this.spfrTextEffects.length - 1);
        }
        let node = instantiate(this.prefabTextEffect);
        let sprite = node.getComponent(Sprite);
        sprite.spriteFrame = this.spfrTextEffects[index];
        this.node.addChild(node);
        this.scheduleOnce(() => {
            node.destroy();
        }, 1);
    }
}


