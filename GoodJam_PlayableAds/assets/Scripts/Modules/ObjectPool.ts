type ActionFunc<T> = (item?: T, ...args: any[]) => T;

export class ObjectPool<T> {
    private pool: T[] = [];
    private activeObjects: Set<T> = new Set();
    private createFunc: ActionFunc<T>;
    private actionOnGet: ActionFunc<T>;
    private actionOnRelease: ActionFunc<T>;
    private actionOnDestroy: ActionFunc<T>;
    private maxSize: number;

    public constructor(
        createFunc: ActionFunc<T>,
        actionOnGet: ActionFunc<T>,
        actionOnRelease: ActionFunc<T>,
        actionOnDestroy: ActionFunc<T>,
        defaultCapacity: number = 10,
        maxSize: number = 20
    ) {
        this.createFunc = createFunc;
        this.actionOnGet = actionOnGet;
        this.actionOnRelease = actionOnRelease;
        this.actionOnDestroy = actionOnDestroy;
        this.maxSize = maxSize;

        for (let i = 0; i < defaultCapacity; i++) {
            const obj = this.createFunc();
            this.actionOnRelease(obj);
            this.pool.push(obj);
        }
    }

    public get(...args: any[]): T | null {
        let obj: T;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else if (this.activeObjects.size < this.maxSize) {
            obj = this.createFunc();
        } else {
            console.warn('Max pool size reached');
            return null;
        }

        this.actionOnGet(obj, ...args);
        this.activeObjects.add(obj);
        return obj;
    }

    public release(obj: T): void {
        if (this.activeObjects.has(obj)) {
            this.actionOnRelease(obj);
            this.activeObjects.delete(obj);
            this.pool.push(obj);
        } else {
            console.warn('Object not managed by this pool');
        }
    }

    public clear(): void {
        this.pool.forEach(obj => this.actionOnDestroy(obj));
        this.pool.length = 0;
        this.activeObjects.forEach(obj => this.actionOnDestroy(obj));
        this.activeObjects.clear();
    }
}