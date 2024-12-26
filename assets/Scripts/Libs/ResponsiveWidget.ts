import { _decorator, Component, Node, view, Widget, screen, UITransform, Vec3, debug, CCBoolean } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResponsiveWidget')
export class ResponsiveWidget extends Component {
    private widget: Widget;
    private uiTransform: UITransform;
    @property({ type: CCBoolean })
    public debug: boolean;
    @property({ type: CCBoolean })
    public anchorLeft: boolean;
    @property({ type: CCBoolean })
    public anchorRight: boolean;

    start() {
        this.widget = this.node.getComponent(Widget);
        this.uiTransform = this.node.getComponent(UITransform);
        this.setResponsivePosition();
    }
    setResponsivePosition() {
        const canvasSize = screen.windowSize;
        const designSize = view.getDesignResolutionSize();

        const canvasAspectRatio = canvasSize.width / canvasSize.height;
        const designRatio = designSize.width / designSize.height;

        const differenceOfRatios = Math.abs(canvasAspectRatio - designRatio);
        const isSame = differenceOfRatios < 0.01;

        if (!isSame) {
            if (canvasAspectRatio > designRatio) {
                // update width value
                const factor = canvasSize.height / designSize.height;
                const actualDesignWidth = designSize.width * factor;
                const differenceWidth = (canvasSize.width - actualDesignWidth) / 2;
                const differenceWidthForDesign = differenceWidth / factor;
                if (this.debug){
                    console.log("factor: " + canvasSize.height + "/" + designSize.height + "=" + factor);
                    console.log("design width: " +actualDesignWidth);
                    console.log("differenceWidth: (" + canvasSize.width + "-" + actualDesignWidth + ")/2 = " + differenceWidth);
                    console.log("differenceWidthForDesign: " + differenceWidthForDesign);
                    console.log("widget left before: " + this.widget.left);
                    console.log("widget right before: " + this.widget.right);
                }
                // align both left & right
                if (this.widget.isAlignLeft && this.widget.isAlignRight) {
                    if (this.anchorLeft) {
                        this.widget.left -= differenceWidthForDesign * 2;
                        this.widget.right += differenceWidthForDesign;
                    } else if (this.anchorRight) {
                        this.widget.left += differenceWidthForDesign;
                        this.widget.right -= differenceWidthForDesign * 2;
                    } else {
                        this.widget.left -= differenceWidthForDesign;
                        this.widget.right -= differenceWidthForDesign;
                    }
                }
                else if (this.widget.isAlignLeft) { // left only
                    this.widget.left -= differenceWidthForDesign;
                }
                else if (this.widget.isAlignRight) { // right only
                    this.widget.right -= differenceWidthForDesign;
                }
                if (this.debug) {
                    console.log("widget left after: " + this.widget.left);
                    console.log("widget right after: " + this.widget.right);
                }
            } else if (canvasAspectRatio < designRatio) {
                // update height value
                const factor = canvasSize.width / designSize.width;
                const actualDesignHeight = designSize.height * factor;
                const differenceHeight = (canvasSize.height - actualDesignHeight) / 2;
                const differenceHeightForDesign = differenceHeight / factor;

                // align both top & bottom
                if (this.widget.isAlignTop && this.widget.isAlignBottom) {
                    this.widget.top -= differenceHeightForDesign;
                    this.widget.bottom -= differenceHeightForDesign;
                }
                else if (this.widget.isAlignTop) { // top only
                    this.widget.top -= differenceHeightForDesign;
                }
                else if (this.widget.isAlignBottom) { // bottom only
                    this.widget.bottom -= differenceHeightForDesign;
                }
            }
        }
    }
}