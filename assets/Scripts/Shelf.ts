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
    private type: string;

    public Init(type: string, data: number[][], sprites: SpriteFrame[]) {
        this.matchObjs = [];
        this.curRow = 0;
        this.type = type;
        for (let i = data.length - 1; i >= 0; i--) { // rows
            const rows = data[i];
            this.matchObjs[i] = [];
            var objId = 0;
            if (type == "Norm") {
                for (let j = 2; j >= 0; j--) {
                    objId = rows[j];
                    if (objId == -1) { continue; }
                    this.SpawnMatchObj(i, j, objId, sprites[objId]);
                }
            } else {
                objId = rows[0];
                this.SpawnMatchObj(i, 1, objId, sprites[objId]);
            }
        }
    }

    public SpawnMatchObj(row: number, col: number, objId: number, spriteFrame: SpriteFrame) {
        var matchObj = instantiate(this.matchObject);
        matchObj.setParent(this.spawnpoints[col]);
        matchObj.getComponent(MatchObj).Init(this, row, col, objId, spriteFrame);
        this.matchObjs[row][col] = matchObj.getComponent(MatchObj);
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

        if (emptyCount == curRowData.length) {
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


