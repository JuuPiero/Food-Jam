import { IItemsLayerData, ILevelData } from "./Data/ILevelData";
import { Random } from "./Modules/Random";

export interface IBoxData {
    id: number;
    total: number;
}
class BoxDataFactorty {

    private _data: ILevelData = null;
    private _layersData: number[][] = [];

    public initialize(data: ILevelData): void {
        this._data = data;
        this._layersData = this.getAllLayersData(this._data);
    }

    // Chọn ID "dễ hoàn thành" nhất cho player:
    // - Ưu tiên ID xuất hiện nhiều nhất trong các layer sắp tới (lookaheadLayers)
    // - Tránh trùng với activeIds nếu có thể
    // - Sau khi chọn, tiêu thụ tối đa 3 occurrences của ID đó từ các layer (giống logic cũ)
    public getBestBoxData(activeIds: number[] = [], lookaheadLayers: number = 2): IBoxData {
        if (!this._layersData || this._layersData.length === 0) return null;

        // Gộp tạm các layer trong phạm vi lookahead để chấm điểm
        const maxLayer = Math.min(lookaheadLayers, this._layersData.length);
        const freq: Map<number, number> = new Map();
        for (let i = 0; i < maxLayer; i++) {
            const layer = this._layersData[i];
            for (let j = 0; j < layer.length; j++) {
                const id = layer[j];
                // if (id === 0) continue;
                freq.set(id, (freq.get(id) || 0) + 1);
            }
        }
        if (freq.size === 0) return null;

        // Tách candidate thành 2 nhóm: tránh trùng activeIds nếu có thể
        const candidates: Array<{ id: number; score: number }> = [];
        freq.forEach((score, id) => {
            candidates.push({ id, score });
        });

        // Sắp xếp: score giảm dần, tie-breaker: id không thuộc activeIds ưu tiên hơn
        candidates.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            const aIn = activeIds.includes(a.id) ? 1 : 0;
            const bIn = activeIds.includes(b.id) ? 1 : 0;
            return aIn - bIn; // id không trùng activeIds đứng trước
        });

        const pick = candidates[0]?.id;
        if (pick == null) return null;

        // Tiêu thụ tối đa 3 occurrences của pick từ _layersData (giống logic cũ)
        let consumed = 0;
        for (let layerIndex = 0; layerIndex < this._layersData.length; layerIndex++) {
            const ids = this._layersData[layerIndex];
            let idx = ids.indexOf(pick);
            while (idx !== -1 && consumed < 3) {
                ids.splice(idx, 1);
                consumed++;
                idx = ids.indexOf(pick);
            }
            if (consumed >= 3) break;
        }

        // Nếu layer đầu trống, bỏ đi để giảm độ sâu
        if (this._layersData[0] && this._layersData[0].length === 0) {
            this._layersData.shift();
        }

        return { id: pick, total: 3 };
    }
    
    public getTutorialBoxData(initID: number, activeIds: number[] = []): IBoxData {
        let firstLayer = this._layersData[0];
        if (firstLayer) {
            // Tìm targetID trong layer đầu tiên và đảm bảo không trùng với activeIds
            let targetID = firstLayer.find(x => x == initID && !activeIds.includes(x));
            
            // Nếu không tìm thấy ID phù hợp, thử tìm ID khác không trùng
            if (!targetID) {
                let availableIds = firstLayer.filter(id => !activeIds.includes(id));
                if (availableIds.length > 0) {
                    targetID = availableIds[0]; // Lấy ID đầu tiên khả dụng
                } else {
                    return null; // Không có ID nào khả dụng
                }
            }
            
            let count = 0;
            // Duyệt qua các mảng phần tử để tìm và xóa id
            for (let layerIndex = 0; layerIndex < this._layersData.length; layerIndex++) {
                let ids = this._layersData[layerIndex];
                let idIndex = ids.indexOf(targetID);
                while (idIndex !== -1 && count < 3) {
                    ids.splice(idIndex, 1); // Xóa id khỏi mảng
                    count++;
                    idIndex = ids.indexOf(targetID); // Tìm vị trí tiếp theo của id
                }
                if (count >= 3) {
                    break; // Dừng khi đã tìm thấy 3 id
                }
            }
            
            // Kiểm tra nếu layer đầu tiên hết ID thì xóa nó  
            if (this._layersData[0] && this._layersData[0].length === 0) {
                this._layersData.shift();
            }
            
            // Trả về IBoxData với id và total = 3
            return { id: targetID, total: 3 };
        }
        return null;
    }
    public getRandomBoxData(activeIds: number[] = []): IBoxData {
        // Lấy mảng phần tử đầu tiên
        let firstLayer = this._layersData[0];
        if (firstLayer) {
            // Lọc ra các ID không trùng với các box đang hoạt động
            let availableIds = firstLayer.filter(id => !activeIds.includes(id));
            
            // Nếu không có ID nào khả dụng trong layer đầu, chuyển sang layer tiếp theo
            if (availableIds.length === 0) {
                this._layersData.shift();
                return this.getRandomBoxData(activeIds); // Đệ quy với layer tiếp theo
            }
            
            // Lấy ngẫu nhiên một id từ mảng ID khả dụng
            let randomIndex = Random.getRandomInt(0, availableIds.length - 1);
            let randomId = availableIds[randomIndex];
            
            let count = 0;
            // Duyệt qua các mảng phần tử để tìm và xóa id
            for (let layerIndex = 0; layerIndex < this._layersData.length; layerIndex++) {
                let ids = this._layersData[layerIndex];
                let idIndex = ids.indexOf(randomId);
                while (idIndex !== -1 && count < 3) {
                    ids.splice(idIndex, 1); // Xóa id khỏi mảng
                    count++;
                    idIndex = ids.indexOf(randomId); // Tìm vị trí tiếp theo của id
                }
                if (count >= 3) {
                    break; // Dừng khi đã tìm thấy 3 id
                }
            }
            
            // Kiểm tra nếu layer đầu tiên hết ID thì xóa nó
            if (this._layersData[0] && this._layersData[0].length === 0) {
                this._layersData.shift();
            }
            
            // Trả về IBoxData với id và total = 3
            return { id: randomId, total: 3 };
        }
    
        return null;
    }

    private getAllLayersData(levelData: ILevelData): number[][] {
        let layersData: IItemsLayerData[][] = [];
        while (true) {
            let data: IItemsLayerData[] = [];
            for (let i = 0; i < levelData.cells.length; i++) {
                let layer = levelData.cells[i];
                if (layer.itemsLayer.length > 0) {
                    let itemData = layer.itemsLayer.shift();
                    data.push(itemData);
                }
            }
            if (data.length === 0) {
                break;
            }
            layersData.push(data);
        }

        // Merge mảng con trong layer thành mảng lớn.
        let newData = [];
        for (let i = 0; i < layersData.length; i++) {
            let temp = [];
            let layerData = layersData[i];
            for (let j = 0; j < layerData.length; j++) {
                let itemData = layerData[j];
                temp = temp.concat(itemData.items);
            }
            temp = temp.filter(item => item !== 0);
            newData.push(temp);
        }
        
        return newData;
    }
}

export default new BoxDataFactorty();