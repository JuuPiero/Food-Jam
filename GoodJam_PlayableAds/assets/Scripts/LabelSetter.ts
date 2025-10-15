import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LabelSetter')
export class LabelSetter extends Component {
    @property(Label)
    public label: Label;

    public setString(str: string)
    {
        this.label.string = str;
    }
}


