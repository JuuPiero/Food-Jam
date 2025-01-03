import { _decorator, Component, instantiate, JsonAsset, Node, Prefab, Sprite, SpriteFrame, TextAsset, Vec2, Vec3 } from 'cc';
import { Shelf } from './Shelf';
import { BoxController } from './BoxController';
import { MatchObj } from './MatchObj';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('MapLoader')
export class MapLoader extends Component {

    @property({ type: [JsonAsset], group: "Data" })
    private levelDataAsset: JsonAsset[] = [];
    @property({ type: [JsonAsset], group: "Data" })
    private boxDataAsset: JsonAsset[] = [];
    @property({ type: [SpriteFrame], group: "Data" })
    private sprites: SpriteFrame[] = [];

    @property({ type: Node, group: "Import" })
    private shelfHolder: Node;
    @property({ type: Prefab, group: "Import" })
    private shelfPrb: Prefab;
    @property({ type: BoxController, group: "Import" })
    private boxController: BoxController;

    @property(Node)
    nodeTutorial: Node = null;

    public Shelfs: Shelf[] = [];

    public static instance: MapLoader = null;

    protected onLoad(): void {
        MapLoader.instance = this;
    }

    protected start(): void {
        this.LoadLevelData(null, "0");
        this.nodeTutorial.active = false;
    }
    public LoadLevelData(event: Event, customEventData: string): void {
        const shelfData = this.levelDataAsset[parseInt(customEventData)].json;
        shelfData.forEach((shelf: ShelfData) => {
            var shelfNode = instantiate(this.shelfPrb);
            shelfNode.setPosition(shelf.position);
            shelfNode.setParent(this.shelfHolder);
            shelfNode.getComponent(Shelf).Init(shelf.type, shelf.data, this.sprites);

            this.Shelfs.push(shelfNode.getComponent(Shelf));
        });

        const boxData = this.boxDataAsset[parseInt(customEventData)].json as BoxData[];
        this.boxController.Init(boxData, this.sprites);

        this.scheduleOnce(() => {
            let obj = this.findItemsTutorial();
            obj.forEach((matchObj, index) => {
                if (index === 2)
                this.nodeTutorial.setWorldPosition(matchObj.node.getWorldPosition());
                this.nodeTutorial.active = true;
            });
        }, 1);
    }

    public findItemsTutorial(): MatchObj[] {
        for (let i = 0; i < this.Shelfs.length; i++) {
            const shelf = this.Shelfs[i];
            let matchObjects = shelf.getComponentsInChildren(MatchObj);
            let obj: MatchObj[] = matchObjects.filter((matchObj) => matchObj.button.interactable);
            if (obj) {
                return obj;
            }
        }
        return null;
    }
}

export class ShelfData {
    type: string;
    position: Vec3;
    data: number[][];

    constructor(type: string, position: Vec3, data: number[][]) {
        this.type = type;
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
