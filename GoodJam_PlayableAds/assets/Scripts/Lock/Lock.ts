import { _decorator, AudioClip, AudioSource, Component, Label, Node, sp, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Lock')
export class Lock extends Component {

    @property(sp.Skeleton)
    skeletonChain: sp.Skeleton = null;

    @property(Label)
    txtHP: Label = null;

    @property(UIOpacity)
    uiSolid: UIOpacity = null;

    @property(UIOpacity)
    uiGlassBreak: UIOpacity = null;

    @property(AudioSource)
    audioLock: AudioSource = null;

    @property(AudioClip)
    audioChain: AudioClip = null;

    @property(AudioClip)
    audioGlass: AudioClip = null;

    @property(Node)
    nodeBlockInput: Node = null;

    public hp: number = 0;

    protected start(): void {
        window.lock = this;
        this.nodeBlockInput.active = true;
    }

    public initialize(hp: number): void {
        this.hp = hp;
        this.txtHP.string = this.hp.toString();
        this.updateAnim();
    }

    public sub(num: number): Promise<number> {
        return new Promise((resolve, reject) => {
            this.hp -= num;
            this.txtHP.string = this.hp.toString();
            this.updateAnim();
            resolve(this.hp);
        });
    }

    public updateAnim(): void {
        switch (this.hp) {
            case 4:
                this.uiSolid.opacity = 255;
                this.uiGlassBreak.opacity = 0;
                this.skeletonChain.setAnimation(0, "idle", true);
                // this.audioLock.playOneShot(this.audioChain);
                break;
            case 3:
                this.uiSolid.opacity = 255;
                this.uiGlassBreak.opacity = 0;
                this.skeletonChain.setMix("idle", "Open_01", 0.2);
                this.skeletonChain.setAnimation(0, "Open_01", false);
                this.skeletonChain.addAnimation(0, "idle_Open_01", true);
                this.audioLock.playOneShot(this.audioChain);
                break;
            case 2:
                this.uiSolid.opacity = 255;
                this.uiGlassBreak.opacity = 0;
                this.skeletonChain.setMix("idle_Open_01", "Open_02", 0.2);
                this.skeletonChain.setAnimation(0, "Open_02", false);
                this.skeletonChain.addAnimation(0, "idle_Open_02", true);
                this.audioLock.playOneShot(this.audioChain);
                break;
            case 1:
                this.uiSolid.opacity = 255;
                tween(this.uiGlassBreak).to(0.3, {opacity: 255}).start();
                this.skeletonChain.setMix("idle_Open_02", "Open_03", 0.2);
                this.skeletonChain.setAnimation(0, "Open_03", false);
                this.skeletonChain.addAnimation(0, "idle_Open_03", true);
                this.audioLock.playOneShot(this.audioChain);
                break;
            case 0:
                tween(this.uiGlassBreak).to(0.3, {opacity: 0}).call(() => {
                    this.uiGlassBreak.node.active = false;
                }).start();
                tween(this.uiSolid).to(0.3, {opacity: 0}).call(() => {
                    this.uiSolid.node.active = false;
                    this.node.active = false;
                }).start();
                this.skeletonChain.setMix("idle_Open_03", "Glass_cabinet", 0.2);
                this.skeletonChain.setAnimation(0, "Glass_cabinet", false);
                this.nodeBlockInput.active = false;
                this.audioLock.playOneShot(this.audioGlass);
                break;
        }
    }
}


