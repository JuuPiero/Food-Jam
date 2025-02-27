export function generateShuffledSubArrays(ids: number[], totalArrays: number): number[][] {
    const allSubArrays: number[][] = [];
    
    // 1. Tạo các mảng con với 3 phần tử giống nhau cho từng ID
    while (allSubArrays.length < totalArrays) {
        for (const id of ids) {
            if (allSubArrays.length < totalArrays) {
                allSubArrays.push([id, id, id]);
            } else {
                break;
            }
        }
    }

    // 2. Nếu chưa đủ, thêm ngẫu nhiên các ID
    while (allSubArrays.length < totalArrays) {
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        allSubArrays.push([randomId, randomId, randomId]);
    }

    // 3. Hợp nhất tất cả mảng con thành một mảng lớn
    const mergedArray: number[] = allSubArrays.flat();

    // 4. Xáo trộn mảng lớn
    const shuffledArray = shuffleArray(mergedArray);

    // 5. Chia lại thành các mảng con có 3 phần tử
    const result: number[][] = [];
    for (let i = 0; i < shuffledArray.length; i += 3) {
        result.push(shuffledArray.slice(i, i + 3));
    }

    return result;
}

// Hàm xáo trộn Fisher-Yates Shuffle
function shuffleArray<T>(array: T[]): T[] {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}