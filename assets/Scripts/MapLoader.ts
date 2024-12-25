import { _decorator, Component, instantiate, Node, Prefab, SpriteFrame, TextAsset, Vec2, Vec3 } from 'cc';
import { Shelf } from './Shelf';
const { ccclass, property } = _decorator;

@ccclass('MapLoader')
export class MapLoader extends Component {

    @property({ type: Node })
    private mapHolder: Node;
    @property({ type: Prefab })
    private shelfPrb: Prefab;
    public Shelfs: Shelf[] = [];

    @property({ type: [TextAsset] })
    private levelDataAsset: TextAsset[] = [];
    private levelDataArray: LevelData[] = [];

    @property({ type: [SpriteFrame] })
    private sprites: SpriteFrame[] = [];
    
    protected start(): void {
        this.LoadLevelData(null, "0");
    }
    public LoadLevelData(event: Event, customEventData: string): void {
        this.levelDataArray = []

        const jsonData = JSON.parse(this.levelDataAsset[parseInt(customEventData)].text);
        jsonData.forEach((shelf: LevelData) => {
            const levelData = new LevelData(shelf.shelf, shelf.position, shelf.data);
            this.levelDataArray.push(levelData);
        });
        this.Init();
    }

    public Init() {
        for (let i = 0; i < this.levelDataArray.length; i++) {
            const shelfData = this.levelDataArray[i];
            var shelf = instantiate(this.shelfPrb);
            shelf.setParent(this.mapHolder);
            shelf.setPosition(shelfData.position);
            shelf.getComponent(Shelf).Init(i, shelfData.data, this.sprites);
            
            this.Shelfs[i] = shelf.getComponent(Shelf);
        }
    }
}

export class LevelData {
    shelf: number;
    position: Vec3;
    data: number[][];

    constructor(shelf: number, position: Vec3, data: number[][]) {
        this.shelf = shelf;
        this.position = position;
        this.data = data;
    }
}
