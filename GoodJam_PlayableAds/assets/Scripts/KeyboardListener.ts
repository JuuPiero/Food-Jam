import { _decorator, AudioSource, Component, EventKeyboard, Input, input, KeyCode, Node, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('KeyboardListener')
export class KeyboardListener extends Component {

    @property(AudioSource)
    audioBackground: AudioSource = null;

    @property([UIOpacity])
    opacity: UIOpacity[] = [];

    public static isCreativeVersion: boolean = false;

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown (event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.SPACE:
                KeyboardListener.isCreativeVersion = true;
                this.opacity.forEach(opacity => {
                    opacity.opacity = 0;
                });
                this.audioBackground.volume = 0;
                break;
        }
    }
}


