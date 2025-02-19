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

    public getRandomBoxData(): IBoxData {
        // Lấy mảng phần tử đầu tiên
        let firstLayer = this._layersData[0];
        if (firstLayer) {
            // Lấy ngẫu nhiên một id từ mảng phần tử đầu tiên
            let randomIndex = Random.getRandomInt(0, firstLayer.length - 1);
            let randomId = firstLayer[randomIndex];
            
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
            if (firstLayer.length === 0) {
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