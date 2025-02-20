export interface IBox {
    initialize(id: number, total: number): void;
    reset(): void;
    complete(): void;
}