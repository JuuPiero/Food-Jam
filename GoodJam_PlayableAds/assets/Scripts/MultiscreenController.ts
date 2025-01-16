import { _decorator, Component, Node, ResolutionPolicy, screen, UITransform, Vec2, Vec3, view, Widget } from 'cc';
import { GameManager } from './Core/GameManager';
const { ccclass, property } = _decorator;

export enum ScreenType {
    Portrait,
    Landscape,
    Square
}
@ccclass('MultiscreenController')
export class MultiscreenController extends Component {

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

    protected start(): void {
        window.addEventListener('resize', this.OnResize.bind(this));
        this.OnResize();
    }

    //region Portrait
    private PortraitUI(ratio: number) {
        view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_HEIGHT);
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
    private LandscapeUI(ratio: number) {
        view.setDesignResolutionSize(1280, 720, ResolutionPolicy.FIXED_HEIGHT);
        MultiscreenController.screenType = ScreenType.Landscape;
        var realWidth = 1280 * ratio;

        // scale with ratio
        this.mapHolder.node.setScale(Vec3.ONE.clone().multiplyScalar(ratio));
        this.header.node.setScale(Vec3.ONE.clone().multiplyScalar(ratio));

        // setup map + header position
        this.mapHolder.bottom = this.mapHolder.top = this.mapHolder.right = 0;
        this.mapHolder.left = this.header.right = realWidth/2;
        this.header.left = 0;
        this.header.top = 100;

        // extra
        this.logo.node.active = true;
        this.logo.left = 0;
        this.logo.right = realWidth/2;
        this.logo.bottom = 145;
    }

    //region Square
    private SquareUI(ratio: number) {
        view.setDesignResolutionSize(1280, 1280, ResolutionPolicy.FIXED_HEIGHT);
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

    private OnResize() {
        const windowSize = screen.windowSize;
        const ratio = windowSize.width / windowSize.height;
        console.log(`Width: ${windowSize.width} Height: ${windowSize.height} Ratio: ${ratio}`);
        if (ratio < 0.65) {
            const scaledRatio = ratio / (720 / 1280);
            this.PortraitUI(scaledRatio);
        } else if (ratio > 1.5) {
            const scaledRatio = ratio / (1280 / 720);
            this.LandscapeUI(scaledRatio);
        } else {
            this.SquareUI(1);
        }

        if (this.firstTime) {
            this.firstTime = false;
            setTimeout(() => {
                GameManager.instance.StartGame();
            }, 50);
        }
    }
}


