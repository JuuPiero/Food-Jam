import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { IntroBase } from './IntroBase';
const { ccclass, property } = _decorator;

@ccclass('Intro_ShelfScale')
export class Intro_ShelfScale extends IntroBase {

    public override StartAnim() {
        // const shelfs = this.mapLoader.Shelfs;
        // for (let i = 0; i < shelfs.length; i++)
        //     shelfs[i].node.setScale(Vec3.ZERO);
    }

    public override Play() {
        // const shelfs = this.mapLoader.Shelfs;
        // const shelfScale = new Vec3(0.5, 0.5, 0.5);
        // for (let i = 0; i < shelfs.length; i++)
        //     tween(shelfs[i].node)
        //         .delay(i * 0.1)
        //         .to(0.2, { scale: shelfScale }, { easing: 'backOut' })
        //         .start();
    }
}