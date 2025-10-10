import { _decorator, Component, Node, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

export enum ETextEffect {
    NICE,
    GOOD_JOB,
    AWESOME,
    AMAZING
}

@ccclass('TextEffect')
export class TextEffect extends Component {
    
    private _textEffect: ETextEffect = ETextEffect.NICE;

    public getTextEffect(): ETextEffect {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(this.resetSchedule.bind(this), 5);
        let textEffect = this._textEffect;
        this._textEffect++;
        if (this._textEffect >= ETextEffect.AMAZING) {
            this._textEffect = ETextEffect.AMAZING;
        }
        return textEffect;
    }

    public getRandomTextEffect(): ETextEffect {
        // Trả về ngẫu nhiên 1 enum
        const random = Math.floor(Math.random() * Object.keys(ETextEffect).length / 2);
        return random as ETextEffect;
    }
    
    private resetSchedule(): void {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this._textEffect = ETextEffect.NICE;
        });
    }
}


