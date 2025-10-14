// Test script để kiểm tra logic ưu tiên cache trong getBestBoxData

import BoxDataFactory, { IBoxData } from './assets/Scripts/BoxDataFactory';
import { SlotManager } from './assets/Scripts/Slot/SlotManager';

// Mock SlotManager cho testing
class MockSlotManager {
    private cacheIds: number[] = [];
    
    constructor(cacheIds: number[]) {
        this.cacheIds = cacheIds;
    }
    
    getIdsInCaches(): number[] {
        return this.cacheIds;
    }
}

// Mock level data
const mockLevelData = {
    cells: [
        {
            itemsLayer: [
                { items: [1, 2, 3, 1, 1] },
                { items: [2, 2, 3, 4, 4] },
                { items: [1, 3, 3, 4, 5] }
            ]
        }
    ]
};

// Test cases
console.log('=== Test BoxDataFactory with Cache Priority ===');

// Initialize factory with mock data
BoxDataFactory.initialize(mockLevelData as any);

// Test 1: Không có cache
console.log('\n1. Test không có cache:');
const mockSlotManager1 = new MockSlotManager([]) as any;
const result1 = BoxDataFactory.getBestBoxData([], 2, mockSlotManager1);
console.log('Result:', result1);
console.log('Expected: ID xuất hiện nhiều nhất (1 or 2 or 3)');

// Test 2: Có ID trong cache
console.log('\n2. Test có ID trong cache:');
const mockSlotManager2 = new MockSlotManager([4, 5]) as any;
const result2 = BoxDataFactory.getBestBoxData([], 2, mockSlotManager2);
console.log('Result:', result2);
console.log('Expected: Ưu tiên ID 4 hoặc 5 từ cache');

// Test 3: Cache ID không có trong layer
console.log('\n3. Test cache ID không có trong layer:');
const mockSlotManager3 = new MockSlotManager([6, 7]) as any;
const result3 = BoxDataFactory.getBestBoxData([], 2, mockSlotManager3);
console.log('Result:', result3);
console.log('Expected: Chọn ID xuất hiện nhiều nhất vì cache không khả dụng');

// Test 4: Tránh activeIds nhưng ưu tiên cache
console.log('\n4. Test tránh activeIds nhưng ưu tiên cache:');
const mockSlotManager4 = new MockSlotManager([1]) as any;
const result4 = BoxDataFactory.getBestBoxData([1], 2, mockSlotManager4);
console.log('Result:', result4);
console.log('Expected: Vẫn chọn ID 1 từ cache dù nằm trong activeIds');

console.log('\n=== Test completed ===');