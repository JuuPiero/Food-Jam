import { _decorator, Component, instantiate, Node, Prefab, resources, SpriteFrame, Vec3 } from 'cc';
import { MatchObj } from './MatchObj';
const { ccclass, property } = _decorator;

@ccclass('Shelf')
export class Shelf extends Component {
    @property({ type: [Node] })
    private spawnpoints: Node[] = [];
    @property({ type: Prefab })
    private matchObject: Prefab;

    private matchObjs: MatchObj[][];
    private curRow: number;

    public Init(id: number, data: number[][], sprites: SpriteFrame[]) {
        this.matchObjs = [];
        this.curRow = 0;

        for (let i = data.length - 1; i >= 0; i--) { // rows
            const rows = data[i];
            this.matchObjs[i] = [];

            for (let j = 2; j >= 0; j--) {
                const objId = rows[j];
                if (objId == -1) { continue; }

                var matchObj = instantiate(this.matchObject);
                matchObj.setParent(this.spawnpoints[j]);
                matchObj.getComponent(MatchObj).Init(this, i, j, objId, sprites[objId]);
                this.matchObjs[i][j] = matchObj.getComponent(MatchObj);
            }
        }
    }

    public RemoveMatchObj(row: number, col: number) {
        this.matchObjs[row][col] = null;
        this.CheckEmptyRow();
    }

    private CheckEmptyRow() {
        let emptyCount = 0;
        let curRowData = this.matchObjs[this.curRow];
        for (let i = 0; i < curRowData.length; i++) {
            const col = curRowData[i];
            if (col == null) emptyCount++;
        }

        if (emptyCount == 3) {
            for (let i = this.curRow; i < this.matchObjs.length; i++) {
                for (let j = 0; j < this.matchObjs[i].length; j++) {
                    let col = this.matchObjs[i][j];
                    if (col != null) col.MoveUp();
                }
            }
            this.curRow++;
        }
    }
}


