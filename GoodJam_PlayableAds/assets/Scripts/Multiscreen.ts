import { _decorator, Canvas, Component, director, Node, ResolutionPolicy, screen, UITransform, Vec2, Vec3, view, Widget } from 'cc';
import { GameManager } from './Core/GameManager';
const { ccclass, property } = _decorator;

export enum ScreenType {
    PORTRAIT,
    LANDSCAPE,
    SQUARE
}
@ccclass('Multiscreen')
export class Multiscreen extends Component {

    @property(Canvas)
    canvas: Canvas = null;

    public screenOrientation: ScreenType = ScreenType.PORTRAIT;

    protected update(dt: number): void {
        const size = view.getVisibleSize();
        let screenOrientation = null;
        if (size.height > size.width && size.width / size.height < 0.7) {
            // Portrait
            screenOrientation = ScreenType.PORTRAIT;
        }
        else if (size.width > size.height && size.height / size.width < 0.75) {
            // Landscape
            screenOrientation = ScreenType.LANDSCAPE;

        }
        else {
            // Square
            screenOrientation = ScreenType.SQUARE;
        }

        if (this.screenOrientation !== screenOrientation) {
            this.screenOrientation = screenOrientation;
            this.updateScreenOrientation();
        }
    }

    // private onSizeChanged(): void {
    //     console.error(1)
    // }
    private updateScreenOrientation(): void {
        switch (this.screenOrientation) {
            case ScreenType.PORTRAIT:
                view.setDesignResolutionSize(1080, 1920, ResolutionPolicy.FIXED_HEIGHT);
                break;
            case ScreenType.LANDSCAPE:
                view.setDesignResolutionSize(1920, 1080, ResolutionPolicy.FIXED_WIDTH);
                break;
            case ScreenType.SQUARE:
                view.setDesignResolutionSize(1080, 1080, ResolutionPolicy.FIXED_HEIGHT);
                break;
        }
    }
}


