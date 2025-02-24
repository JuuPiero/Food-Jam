import { _decorator, AudioSource, Component } from 'cc';
const { ccclass, property } = _decorator;

export enum ESoundEffect {
    BACKGROUND,
    PICKUP,
    DROP_BOX,
    DROP_SLOT,
    COMPLETE_BOX,
    WIN,
    LOSE,
    WARNING
}

@ccclass('AudioManager')
export class AudioManager extends Component {

    @property
    mute: boolean = false;
    @property([AudioSource])
    audioSources: AudioSource[] = [];

    private static _instance: AudioManager;

    protected onLoad(): void {
        if (AudioManager._instance == null) {
            AudioManager._instance = this;
        }
    }

    public static playEffect(sound: ESoundEffect) {
        let self = AudioManager._instance;
        if (self.mute) return;
        self.audioSources[sound].playOneShot(self.audioSources[sound].clip);
    }

    public static playBackground(): void {
        let self = AudioManager._instance;
        if (self.mute) return;
        self.audioSources[ESoundEffect.BACKGROUND].play();
    }
    
    public static stopBackground(): void {
        let self = AudioManager._instance;
        if (self.mute) return;
        self.audioSources[ESoundEffect.BACKGROUND].stop();
    }
}


