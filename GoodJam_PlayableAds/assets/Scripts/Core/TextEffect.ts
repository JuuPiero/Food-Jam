import { _decorator, Component, Node, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

export enum ETextEffect {
    NICE,
    GOOD_JOB,
    AWESOME,
    AMAZING,
    FANTASTIC
}

@ccclass('TextEffect')
export class TextEffect extends Component {
    
    private _textEffect: ETextEffect = ETextEffect.NICE;

    public getTextEffect(): ETextEffect {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(this.resetSchedule.bind(this), 5);
        let textEffect = this._textEffect;
        this._textEffect++;
        if (this._textEffect >= ETextEffect.FANTASTIC) {
            this._textEffect = ETextEffect.FANTASTIC;
        }
        return textEffect;
    }

    private resetSchedule(): void {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this._textEffect = ETextEffect.NICE;
        });
    }
}


