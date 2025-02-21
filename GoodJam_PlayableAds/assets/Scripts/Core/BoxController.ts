import { _decorator, Component, instantiate, Layout, math, Node, Prefab, SpriteFrame, Tween, tween, Vec3 } from 'cc';
import { AudioManager } from '../AudioManager';
import { PromiseUtils } from '../PromiseUtils';
import { Box } from '../Box/Box';
const { ccclass, property } = _decorator;

@ccclass('BoxController')
export class BoxController extends Component {
    @property({ type: Prefab })
    private boxPrb: Prefab;
    @property({ type: [Vec3] })
    private spawnPoint: Vec3[]=[];

    private static maxBoxSee: number = 4;
    public static maxObj: number;
    public Boxes: Box[] = [];
    
    public Init(boxData: BoxData[], sprites: SpriteFrame[]) {
        let total = 0;
        for (let i = 0; i < boxData.length; i++) {
            const box = boxData[i];
            var boxNode = instantiate(this.boxPrb);
            boxNode.setParent(this.node);
            boxNode.setPosition(this.spawnPoint[Math.min(i, 4)]);
            boxNode.getComponent(Box).Init(box.id, box.count, sprites[box.id]);
            boxNode.active = (i < BoxController.maxBoxSee);

            this.Boxes.push(boxNode.getComponent(Box));

            total += box.count;
        }
        BoxController.maxObj = total;

        setTimeout(() => {
            this.node.getComponent(Layout).enabled = false;
        }, 50);
    }

    public CheckContainId(objId: number): number {
        for (let i = 0; i < this.Boxes.length; i++) {
            const box = this.Boxes[i];
            if (box == null || !box.node.active) continue;
            // Box active = true sẽ chạy xuống đây
            if (box.id == objId && box.count > 0) {

                if (box.Collect()) {
                    // move box to new pos (wait for anim done)
                    setTimeout(async () => {
                        AudioManager.instance.PlayAudio(AudioType.CompleteBox);
                        this.Boxes[i].animBox.play("CompleteBox");
                        await PromiseUtils.delay(2);
                        this.Boxes[i].node.active = false;
                        this.Boxes[i] = null;
                        Tween.stopAllByTag(0);
                        for (let j = 0, k = 0; j < this.Boxes.length; j++) {
                            const box = this.Boxes[j];
                            if (box != null){
                                box.node.active = true;
                                tween(box.node)
                                    .tag(0)
                                    .to(0.12, { position: this.spawnPoint[k] }, { easing: 'sineIn' })
                                    .call(() => {
                                        // box.animBox.play("CompleteBox");
                                    })
                                    .start();
                                k++;
                                if (k >= BoxController.maxBoxSee) break;
                            }
                        }
                    }, 200);
                }
                else {
                    this.scheduleOnce(() => {
                        this.Boxes[i].animBox.play("ActionBox");
                    }, 0.5);
                }
                return i;
            }
        }
        return -1;
    }
}


