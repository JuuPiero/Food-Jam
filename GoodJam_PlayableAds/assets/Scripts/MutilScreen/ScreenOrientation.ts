import { _decorator, Camera, CCFloat, Component, Enum, Node, ResolutionPolicy, screen, Size, view } from 'cc';
const { ccclass, property } = _decorator;

export enum EScreenOrientation {
    PORTRAIT,
    LANDSCAPE,
    SQUARE
}

@ccclass('ScreenOrientation')
export class ScreenOrientation extends Component {
    
    @property({type: Enum(EScreenOrientation)})
    public orientation: EScreenOrientation = EScreenOrientation.PORTRAIT;

    @property([Node])
    nodeScreenOrientation: Node[] = [];

    @property([CCFloat])
    orthoHeight: number[] = [];

    @property(Camera)
    bgCamera: Camera = null;

    @property(Camera)
    shadowCamera: Camera = null;

    @property(Camera)
    gameCamera: Camera = null;

    @property(Camera)
    tutorialCamera: Camera = null;

    @property(Camera)
    uiCamera: Camera = null;

    @property(Camera)
    uiResultCamera: Camera = null;

    @property(Node)
    nodeBGHeader: Node = null;

    protected start(): void {
        this.onSizeChanged();
    }

    protected update(dt: number): void {
        let bgOrtho = this.bgCamera.orthoHeight;
        let uiOrtho = this.uiCamera.orthoHeight;
        if (bgOrtho !== uiOrtho) {
            this.bgCamera.orthoHeight = uiOrtho;
        }
    }

    public onSizeChanged(): void {
        let size = screen.windowSize;
        let ratio = size.width / size.height;
        if (size.width < size.height && ratio < 0.65) {
            console.log("%cPORTRAIT", "color: red");
            this.orientation = EScreenOrientation.PORTRAIT;
        }
        else if (size.width > size.height && ratio > 1.5) {
            console.log("%cLANDSCAPE", "color: red");
            this.orientation = EScreenOrientation.LANDSCAPE;
        }
        else {
            console.log("%cSQUARE", "color: red");
            this.orientation = EScreenOrientation.SQUARE;
        }
        this.bgCamera.orthoHeight = this.uiCamera.orthoHeight;

        // Bật tắt UI
        this.nodeScreenOrientation.forEach((node, index) => {
            if (index === this.orientation) {
                node.active = true;
            } else {
                node.active = false;
            }
        });

        // Chỉnh kích thước camera
        switch (this.orientation) {
            case EScreenOrientation.PORTRAIT:
                this.nodeBGHeader.active = true;
                this.enablePortrait();
                break;
            case EScreenOrientation.LANDSCAPE:
                this.nodeBGHeader.active = false;
                this.enableLandscape();
                break;
            case EScreenOrientation.SQUARE:
                this.nodeBGHeader.active = false;
                this.enableSquare();
                break;
        }
    }

    private enablePortrait(): void {
        view.setDesignResolutionSize(1080, 1920, ResolutionPolicy.FIXED_HEIGHT);
        let size = screen.windowSize;
        let designRatio = 1080 / 1920;
        let realRatio = size.width / size.height;
        let newOrthoHeight = this.orthoHeight[this.orientation] * designRatio / realRatio;
        console.log("%cnewOrthoHeight: ", "color: blue", newOrthoHeight);
        this.shadowCamera.orthoHeight = newOrthoHeight;
        this.gameCamera.orthoHeight = newOrthoHeight;
        this.uiResultCamera.orthoHeight = this.gameCamera.orthoHeight;
        this.tutorialCamera.orthoHeight = this.gameCamera.orthoHeight;
    }

    private enableLandscape(): void {
        view.setDesignResolutionSize(1920, 1080, ResolutionPolicy.FIXED_WIDTH);
        let size = screen.windowSize;
        let designRatio = 1920 / 1080;
        let realRatio = size.width / size.height;
        // let newOrthoHeight = this.orthoHeight[this.orientation] * realRatio / designRatio;
        // console.log("%cnewOrthoHeight: ", "color: blue", newOrthoHeight);
        // this.shadowCamera.orthoHeight = newOrthoHeight;
        // this.gameCamera.orthoHeight = newOrthoHeight;
    }

    private enableSquare(): void {
        view.setDesignResolutionSize(1080, 1080, ResolutionPolicy.FIXED_HEIGHT);
        let size = screen.windowSize;
        let designRatio = 1080 / 1080;
        let realRatio = size.width / size.height;
        // let newOrthoHeight = this.orthoHeight[this.orientation] * designRatio / realRatio;
        // console.log("%cnewOrthoHeight: ", "color: blue", newOrthoHeight);
        // this.shadowCamera.orthoHeight = newOrthoHeight;
        // this.gameCamera.orthoHeight = newOrthoHeight;
    }
}



