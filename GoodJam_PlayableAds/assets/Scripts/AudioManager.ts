import { _decorator, AudioSource, Component } from 'cc';
const { ccclass, property } = _decorator;

export enum AudioType {
    Background,
    Screw,
    Win,
    Lose,
    Close_Box,
    Warning,
    ScrewHoleToBox,
    Collider,
    Confetti,
    CompleteBox,
    WoodBreak,
    TutorialCompleted,
    Sad,
    ChainBreak
}

@ccclass('AudioManager')
export class AudioManager extends Component {

    public static instance: AudioManager;

    @property([AudioSource])
    audioSources: AudioSource[] = [];

    protected onLoad(): void {
        if (AudioManager.instance == null) {
            AudioManager.instance = this;
        }
    }

    public PlayAudio(type: AudioType) {
        this.audioSources[type].playOneShot(this.audioSources[type].clip);
    }

    PlayBackground() {
        this.audioSources[AudioType.Background].play();
    }
}


