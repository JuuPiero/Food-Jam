import { _decorator, AudioSource, Component } from 'cc';
import { CreativeDataRecord } from './CreativeDataRecord';
const { ccclass, property } = _decorator;

export enum ESoundEffect {
    BACKGROUND,
    PICKUP,
    DROP_BOX,
    DROP_SLOT,
    COMPLETE_BOX,
    WIN,
    LOSE,
    WARNING,
    FAIL,
    TYPING,
    CONFETTI,
    MEAT
}

@ccclass('AudioManager')
export class AudioManager extends Component {

    @property([AudioSource])
    audioSources: AudioSource[] = [];

    public static mute: boolean = false;
    
    private static _instance: AudioManager;

    @property(CreativeDataRecord)
    audioEventRecorder: CreativeDataRecord;

    protected onLoad(): void {
        if (AudioManager._instance == null) {
            AudioManager._instance = this;
        }
    }

    public static playEffect(sound: ESoundEffect)
    {
        

        let self = AudioManager._instance;
        self.audioEventRecorder.AddData(ESoundEffect[ sound ], 0, 0);
        if (AudioManager.mute) return;
        self.audioSources[sound].playOneShot(self.audioSources[sound].clip);
    }

    public static playBackground(): void {
        let self = AudioManager._instance;
        if (AudioManager.mute) return;
        self.audioSources[ESoundEffect.BACKGROUND].play();
    }
    
    public static stopBackground(): void {
        let self = AudioManager._instance;
        if (AudioManager.mute) return;
        self.audioSources[ESoundEffect.BACKGROUND].stop();
    }
}


