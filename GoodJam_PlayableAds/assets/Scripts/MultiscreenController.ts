import { _decorator, Canvas, Component, Node, ResolutionPolicy, screen, UITransform, Vec2, Vec3, view, Widget } from 'cc';
import { GameManager } from './Core/GameManager';
const { ccclass, property } = _decorator;

export enum ScreenType {
    Portrait,
    Landscape,
    Square
}
@ccclass('MultiscreenController')
export class MultiscreenController extends Component {

    @property(Canvas)
    canvas: Canvas = null;

    private firstTime: boolean = true;
    public static screenType: ScreenType = ScreenType.Portrait;

    @property({ type: Widget })
    private bg: Widget;
    @property({ type: Widget})
    private logo: Widget;
    @property({ type: Widget })
    private header: Widget;
    @property({ type: Widget })
    private mapHolder: Widget;
    @property(Node)
    nodeTapToPlay: Node = null;

    protected onEnable(): void {
        this.canvas.node.on(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
    }

    protected onDisable(): void {
        this.canvas.node.off(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
    }

    private onSizeChanged(): void {
        const windowSize = screen.windowSize;
        const ratio = windowSize.width / windowSize.height;
        console.log(`Width: ${windowSize.width} Height: ${windowSize.height} Ratio: ${ratio}`);
        if (ratio < 0.7) {
            const scale = ratio / 0.5625;
            this.updatePortraitUI(scale);

        } else if (ratio > 1.5) {
            const scale = ratio / (1920 / 1080);
            this.updateLandscapeUI(scale);

        } else {
            this.updateSquareUI(ratio);

        }
    }

    //region Portrait
    private updatePortraitUI(ratio: number) {
        view.setDesignResolutionSize(1080, 1920, ResolutionPolicy.FIXED_HEIGHT);
        MultiscreenController.screenType = ScreenType.Portrait;

        // scale with ratio
        this.mapHolder.node.setScale(Vec3.ONE.clone().multiplyScalar(ratio));
        this.header.node.setScale(Vec3.ONE.clone().multiplyScalar(ratio));

        // setup map + header position
        this.mapHolder.bottom = this.mapHolder.left = this.mapHolder.right = 0;
        this.mapHolder.top = this.header.getComponent(UITransform).contentSize.height * ratio;
        this.header.top = 0.03;
        this.header.left = this.header.right = 0;

        // extra
        this.logo.node.active = false;
    }

    //region Landscape
    private updateLandscapeUI(ratio: number) {
        view.setDesignResolutionSize(1920, 1080, ResolutionPolicy.FIXED_HEIGHT);
        MultiscreenController.screenType = ScreenType.Landscape;
        var realWidth = 1280 * ratio;

        // scale with ratio
        this.mapHolder.node.setScale(Vec3.ONE.clone().multiplyScalar(ratio));
        this.header.node.setScale(Vec3.ONE.clone().multiplyScalar(ratio));

        // setup map + header position
        this.mapHolder.bottom = this.mapHolder.top = this.mapHolder.right = 0;
        this.mapHolder.left = this.header.right = realWidth/2;
        this.header.left = 0;
        this.header.top = 0.03;

        // extra
        this.logo.node.active = true;
        this.logo.left = 0;
        this.logo.right = realWidth/2;
        this.logo.bottom = 145;
    }

    //region Square
    private updateSquareUI(ratio: number) {
        view.setDesignResolutionSize(1920, 1920, ResolutionPolicy.FIXED_HEIGHT);
        MultiscreenController.screenType = ScreenType.Square;

        // scale with ratio
        this.mapHolder.node.setScale(Vec3.ONE.clone().multiplyScalar(ratio));
        this.header.node.setScale(Vec3.ONE.clone().multiplyScalar(ratio));

        // setup map + header position
        this.mapHolder.bottom = this.mapHolder.left = this.mapHolder.right = 0;
        this.mapHolder.top = this.header.getComponent(UITransform).contentSize.height * ratio;
        this.header.top = this.header.left = this.header.right = 0;
        
        // extra
        this.logo.node.active = false;
    }
}


