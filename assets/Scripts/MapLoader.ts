import { _decorator, Component, instantiate, Node, Prefab, SpriteFrame, TextAsset, Vec2, Vec3 } from 'cc';
import { Shelf } from './Shelf';
import { BoxController } from './BoxController';
const { ccclass, property } = _decorator;

@ccclass('MapLoader')
export class MapLoader extends Component {

    @property({ type: Node })
    private shelfHolder: Node;
    @property({ type: Prefab })
    private shelfPrb: Prefab;
    public Shelfs: Shelf[] = [];

    @property({ type: BoxController })
    private boxController: BoxController;

    @property({ type: [TextAsset] })
    private levelDataAsset: TextAsset[] = [];

    @property({ type: [TextAsset] })
    private boxDataAsset: TextAsset[] = [];

    @property({ type: [SpriteFrame] })
    private sprites: SpriteFrame[] = [];
    
    protected start(): void {
        this.LoadLevelData(null, "0");
    }
    public LoadLevelData(event: Event, customEventData: string): void {
        const shelfData = JSON.parse(this.levelDataAsset[parseInt(customEventData)].text);
        shelfData.forEach((shelf: ShelfData) => {
            var shelfNode = instantiate(this.shelfPrb);
            shelfNode.setPosition(shelf.position);
            shelfNode.setParent(this.shelfHolder);
            shelfNode.getComponent(Shelf).Init(shelf.shelf, shelf.data, this.sprites);

            this.Shelfs.push(shelfNode.getComponent(Shelf));
        });

        const boxData = JSON.parse(this.boxDataAsset[parseInt(customEventData)].text);
        this.boxController.Init(boxData, this.sprites);
    }
}

export class ShelfData {
    shelf: number;
    position: Vec3;
    data: number[][];

    constructor(shelf: number, position: Vec3, data: number[][]) {
        this.shelf = shelf;
        this.position = position;
        this.data = data;
    }
}

export class BoxData {
    id: number;
    count: number;

    constructor(id: number, count: number) {
        this.id = id;
        this.count = count;
    }
}
