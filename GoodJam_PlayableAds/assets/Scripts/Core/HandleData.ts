import { EShelfType, ILevelData } from "../Data/ILevelData";

export class HandleData {
    public static updatePosition(data: ILevelData): ILevelData {
        data.cells.forEach(cell => {
            cell.posX += 3;
            cell.posY += 2;
        });
        return data;
    }

    public static updatePositionSingleShelf(data: ILevelData): ILevelData {
        data.cells.forEach(cell => {
            if (cell.cellType === EShelfType.SINGLE) {
                cell.posX -= 2;
            }
        });
        return data;
    }

    public static sortData(data: ILevelData): ILevelData {
        // Tạo một bản sao của data để không thay đổi dữ liệu gốc
        const sortedData = { ...data };
        
        // Sắp xếp mảng cells
        sortedData.cells.sort((a, b) => {
            // Nếu posY khác nhau, sắp xếp theo posY tăng dần
            if (a.posY !== b.posY) {
                return a.posY - b.posY;
            }
            // Nếu posY bằng nhau, sắp xếp theo posX giảm dần
            return b.posX - a.posX;
        });

        return sortedData;
    }
}
